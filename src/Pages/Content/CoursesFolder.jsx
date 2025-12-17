import { Button, Input, message, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { FaEdit, FaFolder, FaSave } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses, updateCourse } from "../../redux/slices/courseSlice";

const CoursesFolder = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [updatedCourseName, setUpdatedCourseName] = useState("");
  const [masterFolder, setMasterFolder] = useState(null);
  const [masterFolderLoading, setMasterFolderLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Master Folder
  const fetchMasterFolder = async () => {
    try {
      setMasterFolderLoading(true);
      const response = await api.get('/admin/master-folder/hierarchy');
      
      if (response.data.success) {
        setMasterFolder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Master Folder:', error);
      
      // If Master Folder doesn't exist, try to initialize it
      if (error.response?.status === 404) {
        try {
          await api.post('/admin/master-folder/initialize');
          message.success('Master Folder System initialized successfully!');
          
          // Retry fetching after initialization
          const retryResponse = await api.get('/admin/master-folder/hierarchy');
          if (retryResponse.data.success) {
            setMasterFolder(retryResponse.data.data);
          }
        } catch (initError) {
          console.error('Error initializing Master Folder:', initError);
          message.error('Failed to initialize Master Folder System');
        }
      } else {
        message.error('Failed to load Master Folder');
      }
    } finally {
      setMasterFolderLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchCourses());
    fetchMasterFolder();
  }, [dispatch]);

  const handleFolderClick = (courseId) => {
    if (!editingCourseId) navigate(`/content/subjects/${courseId}`);
  };

  const handleMasterFolderClick = () => {
    if (masterFolder && masterFolder._id) {
      console.log('🔍 [DEBUG] CoursesFolder handleMasterFolderClick called with:', { masterFolder: masterFolder._id, type: typeof masterFolder._id });
      
      const cleanFolderId = typeof masterFolder._id === 'object' ? masterFolder._id._id || masterFolder._id.id : masterFolder._id;
      
      if (!cleanFolderId) {
        console.error('❌ [ERROR] Invalid master folder ID in CoursesFolder:', masterFolder._id);
        message.error('Invalid master folder ID');
        return;
      }
      
      console.log('✅ [DEBUG] CoursesFolder navigating to master folder:', cleanFolderId);
      navigate(`/folder/${cleanFolderId}`);
    }
  };

  const handleEditClick = (e, course) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Prevents navigating when edit icon is clicked
    }
    setEditingCourseId(course._id);
    setUpdatedCourseName(course.title);
  };

  const handleSaveEdit = async (e, courseId) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Prevents navigating when save icon is clicked
    }
    try {
      await dispatch(
        updateCourse({
          id: courseId,
          updatedData: { title: updatedCourseName },
        })
      ).unwrap();
      toast.success("Course updated successfully");
      setEditingCourseId(null); // Exit editing mode
      dispatch(fetchCourses()); // Refresh course list
    } catch (error) {
      toast.error("Failed to update course");
      console.error("Failed to update course:", error);
    }
  };

  const handleAddFolder = () => {
    console.log("Adding new folder:", newFolderName);
    setModalVisible(false);
    setNewFolderName("");
  };

  return (
    <div className="p-6">
      {/* Header with Add Folder Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Content Management</h2>
          <p className="text-gray-400 text-sm">Master Folder & Course Folders</p>
        </div>
      </div>

      {/* Modal for Adding New Folder */}
      <Modal
        title="Add New Folder"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddFolder}>
            Add Folder
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </Modal>

      {/* Render Folder List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Master Folder - Always show first */}
        {masterFolderLoading ? (
          <div className="flex flex-col items-center">
            <FaFolder size={70} className="text-gray-400 animate-pulse" />
            <p className="text-gray-400 mt-2">Loading Master Folder...</p>
          </div>
        ) : masterFolder ? (
          <div
            className="flex flex-col items-center cursor-pointer transition-all transform hover:scale-105"
            onClick={handleMasterFolderClick}
          >
            <div className="relative">
              <FaFolder size={70} style={{ color: '#9333ea' }} className="text-purple-600" />
              {/* <div className="absolute -top-2 -right-2 text-yellow-400 text-2xl">👑</div> */}
            </div>
            <div className="flex items-center mt-2">
              <p className="text-white text-lg font-semibold text-center">
                📁 Master Content Folder
              </p>
            </div>
            {/* <div className="flex items-center mt-1">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                👑 Master
              </span>
              <FaLock className="text-purple-400 ml-2" size={12} />
            </div> */}
            {/* <p className="text-gray-400 text-xs mt-1">
              {masterFolder.folders?.length || 0} subfolders
            </p> */}
          </div>
        ) : null}

        {/* Course Folders */}
        {loading ? (
          <p>Loading courses...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col items-center cursor-pointer transition-all transform hover:scale-105"
              onClick={() => handleFolderClick(course._id)}
            >
              <FaFolder size={70} style={{ color: '#2563eb' }} className="text-blue-600" />{" "}
              {/* Blue course folder - using inline style for better specificity */}
              {editingCourseId === course._id ? (
                // Edit Mode
                <div className="flex items-center">
                  <Input
                    value={updatedCourseName}
                    onChange={(e) => setUpdatedCourseName(e.target.value)}
                    onClick={(e) => {
                      if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                      }
                    }} // Prevents navigation on input click
                    style={{ width: "70%", marginRight: "8px" }}
                  />
                  <FaSave
                    className="text-green-500 cursor-pointer"
                    onClick={(e) => handleSaveEdit(e, course._id)}
                  />
                </div>
              ) : (
                // Display Mode
                <div className="flex items-center">
                  <p className="text-white mt-2 text-lg font-semibold text-center">
                    {course.title}
                  </p>
                  <FaEdit
                    className="text-gray-400 ml-2 cursor-pointer"
                    onClick={(e) => handleEditClick(e, course)}
                  />
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-400">No courses available</p>
        )}
      </div>
    </div>
  );
};

export default HOC(CoursesFolder);
