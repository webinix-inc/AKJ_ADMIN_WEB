import { Dropdown, Menu, Spin, message } from "antd";
import React, { useEffect, useState } from "react";
import { FaEllipsisV, FaFolder } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses } from "../../redux/slices/courseSlice";

function FolderComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);
  
  // Master Folder state
  const [masterFolder, setMasterFolder] = useState(null);
  const [masterFolderLoading, setMasterFolderLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchMasterFolder();
  }, [dispatch]);

  const fetchMasterFolder = async () => {
    try {
      setMasterFolderLoading(true);
      const response = await api.get('/admin/master-folder/hierarchy');
      setMasterFolder(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // Master folder doesn't exist, try to initialize it
        try {
          await api.post('/admin/master-folder/initialize');
          // Retry fetching after initialization
          const retryResponse = await api.get('/admin/master-folder/hierarchy');
          setMasterFolder(retryResponse.data.data);
        } catch (initError) {
          console.error('Error initializing Master Folder:', initError);
        }
      } else {
        console.error('Error fetching Master Folder:', error);
      }
    } finally {
      setMasterFolderLoading(false);
    }
  };

  const handleMasterFolderClick = () => {
    if (masterFolder) {
      console.log('🔍 [DEBUG] FolderStructure handleMasterFolderClick called with:', { masterFolder: masterFolder._id, type: typeof masterFolder._id });
      
      const cleanFolderId = typeof masterFolder._id === 'object' ? masterFolder._id._id || masterFolder._id.id : masterFolder._id;
      
      if (!cleanFolderId) {
        console.error('❌ [ERROR] Invalid master folder ID:', masterFolder._id);
        message.error('Invalid master folder ID');
        return;
      }
      
      console.log('✅ [DEBUG] FolderStructure navigating to master folder:', cleanFolderId);
      navigate(`/folder/${cleanFolderId}`);
    }
  };

  const handleFolderClick = (folderId) => {
    console.log('🔍 [DEBUG] FolderStructure handleFolderClick called with:', { folderId, type: typeof folderId });
    
    // Ensure we have a valid string ID
    const cleanFolderId = typeof folderId === 'object' ? folderId._id || folderId.id : folderId;
    
    if (!cleanFolderId) {
      console.error('❌ [ERROR] Invalid folder ID in FolderStructure:', folderId);
      message.error('Invalid folder ID');
      return;
    }
    
    console.log('✅ [DEBUG] FolderStructure navigating to folder:', cleanFolderId);
    navigate(`/folder/${cleanFolderId}`);
  };

  const handleToggleDownload = async (rootFolderId, allowDownload) => {
    try {
      const response = await api.post("/admin/updateDownloads", {
        rootFolderId,
        allowDownload,
      });

      console.log("Download toggle updated:", response.data);
      alert(
        `Downloads have been ${
          allowDownload ? "enabled" : "disabled"
        } successfully.`
      );
    } catch (error) {
      console.error("Error updating download setting:", error);
      alert("Failed to update download setting. Please try again.");
    }
  };

  const menuForDownloadAccess = (rootFolderId) => (
    <Menu>
      <Menu.Item
        key="1"
        onClick={() => handleToggleDownload(rootFolderId, true)}
      >
        Allow Downloads
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => handleToggleDownload(rootFolderId, false)}
      >
        Block Downloads
      </Menu.Item>
    </Menu>
  );

  if (loading) return <div>Loading courses...</div>;

  return (
    <div className="p-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Content Management</h1>
        <p className="text-gray-300">Master Folder & Course Folders</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-white">
        {/* Master Folder - Always First */}
        {masterFolderLoading ? (
          <div className="relative flex flex-col items-center">
            <div className="w-full flex flex-col items-center">
              <Spin size="large" />
              <p className="text-center mt-2">Loading Master Folder...</p>
            </div>
          </div>
        ) : masterFolder ? (
          <div className="relative flex flex-col items-center" key="master-folder">
            <div
              className="w-full flex flex-col items-center cursor-pointer group"
              onClick={handleMasterFolderClick}
            >
              {/* Master Folder Icon with distinct purple styling */}
              <div className="relative">
                <FaFolder 
                  color="#8B5CF6" 
                  size={100} 
                  className="group-hover:scale-105 transition-transform duration-200"
                />
                {/* Crown icon overlay */}
                {/* <div className="absolute -top-2 -right-2 text-yellow-400 text-xl">
                  👑
                </div> */}
                {/* Lock icon overlay */}
                {/* <div className="absolute -bottom-1 -right-1">
                  <FaLock color="#8B5CF6" size={20} />
                </div> */}
              </div>
              <div className="text-center mt-2">
                <p className="font-semibold">Master Content Folder</p>
                {/* <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="px-2 py-1 bg-purple-600 text-xs rounded-full">👑 Master</span>
                  <span className="text-xs text-gray-300">
                    {masterFolder.subfolders?.length || 0} subfolders
                  </span>
                </div> */}
              </div>
            </div>
            {/* No dropdown menu for Master Folder - it's protected */}
          </div>
        ) : null}

        {/* Course Folders */}
        {courses.map((course) => (
          <div className="relative flex flex-col items-center" key={course._id}>
            <div
              className="w-full flex flex-col items-center cursor-pointer"
              onClick={() => handleFolderClick(course.rootFolder)}
            >
              <FaFolder className="text-blue-600" size={100} />
              <p className="text-center">{course.title}</p>
            </div>

            <div className="absolute top-2 right-2">
              <Dropdown
                overlay={menuForDownloadAccess(course.rootFolder)}
                trigger={["click"]}
              >
                <a onClick={(e) => e.preventDefault()}>
                  <FaEllipsisV className="text-white cursor-pointer" />
                </a>
              </Dropdown>
            </div>
          </div>
        ))}

        {/* Empty state message */}
        {!masterFolderLoading && !masterFolder && courses.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-8">
            <p>No folders available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HOC(FolderComponent);
