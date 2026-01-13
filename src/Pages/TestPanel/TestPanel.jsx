import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AiFillFolder } from "react-icons/ai";
import { FiMoreVertical, FiSearch, FiPlus, FiGrid, FiList } from "react-icons/fi";
import { FaTrashAlt, FaEdit, FaEye, FaEyeSlash, FaFolder } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Dropdown,
  Modal,
  Input,
  Select,
  Button,
  message,
  Switch,
  Spin,
  Empty
} from "antd";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import "./TestPanel.css"; // Import new styles

const { Option } = Select;
const { confirm } = Modal;

// Skeleton Component
const FolderSkeleton = () => (
  <div className="folder-card animate-pulse">
    <div className="folder-icon-wrapper bg-gray-800" />
    <div className="h-4 bg-gray-800 w-3/4 rounded mb-2" />
    <div className="h-3 bg-gray-800 w-1/2 rounded" />
  </div>
);

const TestPanel = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [filteredFolders, setFilteredFolders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [editingFolder, setEditingFolder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchFolders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/testPanel/folders");
      const folderData = response.data.folders.map((folder) => ({
        ...folder,
        isVisible: folder.isVisible ?? false,
      }));
      setFolders(folderData);
      setFilteredFolders(folderData);
    } catch (error) {
      console.error("Error fetching folders:", error);
      message.error("Failed to fetch folders.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await api.get("/admin/courses");
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      // message.error("Failed to fetch courses.");
    }
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchCourses();
  }, [fetchFolders, fetchCourses]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredFolders(folders);
    } else {
      const lowerCaseTerm = searchTerm.toLowerCase();
      setFilteredFolders(
        folders.filter((folder) =>
          folder.name.toLowerCase().includes(lowerCaseTerm)
        )
      );
    }
  }, [searchTerm, folders]);

  const handleOpenModal = (folder = null) => {
    if (folder) {
      setNewFolderName(folder.name);
      setSelectedCourses(folder.courses.map((course) => course._id));
      setEditingFolder(folder);
    } else {
      setNewFolderName("");
      setSelectedCourses([]);
      setEditingFolder(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFolder(null);
    setNewFolderName("");
    setSelectedCourses([]);
  };

  const handleAddOrUpdateFolder = async () => {
    if (!newFolderName.trim()) {
      message.error("Please enter a folder name.");
      return;
    }

    try {
      if (editingFolder) {
        await api.patch(`/testPanel/folders/${editingFolder._id}`, {
          name: newFolderName,
          courses: selectedCourses,
        });
        message.success("Folder updated successfully.");
      } else {
        await api.post("/testPanel/create-quiz-folder", {
          name: newFolderName,
          courses: selectedCourses,
        });
        message.success("Folder created successfully.");
      }
      fetchFolders();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving folder:", error);
      message.error("Failed to save folder.");
    }
  };

  const handleDeleteFolder = async (id) => {
    try {
      await api.delete(`/testPanel/folders/${id}`);
      fetchFolders();
      message.success("Folder deleted successfully.");
    } catch (error) {
      console.error("Error deleting folder:", error);
      message.error("Failed to delete folder.");
    }
  };

  const confirmDelete = (id) => {
    confirm({
      title: "Delete this folder?",
      content: "This will remove the folder and its associations. Quizzes inside might be lost.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      maskClosable: true,
      onOk: () => handleDeleteFolder(id),
    });
  };

  const handleToggleVisibility = async (folder) => {
    try {
      const updatedVisibility = !folder.isVisible;
      await api.patch(`/testPanel/folders/${folder._id}`, {
        isVisible: updatedVisibility,
      });
      // Optimistic update
      setFolders(prev => prev.map(f => f._id === folder._id ? { ...f, isVisible: updatedVisibility } : f));
      message.success(updatedVisibility ? "Folder is now visible" : "Folder is hidden");
    } catch (error) {
      console.error("Error updating folder visibility:", error);
      message.error("Failed to update visibility.");
      // Revert optimization if needed, or just refetch
      fetchFolders();
    }
  };

  const handleFolderClick = (folderId) => {
    navigate(`/content/testpanel/${folderId}`);
  };

  const renderFolderMenu = (folder) => (
    <Menu>
      <Menu.Item key="edit" onClick={() => handleOpenModal(folder)} icon={<FaEdit />}>
        Edit Folder
      </Menu.Item>
      <Menu.Item key="visibility" onClick={() => handleToggleVisibility(folder)} icon={folder.isVisible ? <FaEyeSlash /> : <FaEye />}>
        {folder.isVisible ? 'Hide Folder' : 'Make Visible'}
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="delete" danger onClick={() => confirmDelete(folder._id)} icon={<FaTrashAlt />}>
        Delete Folder
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="test-panel-container">
      {/* Header */}
      <div className="test-panel-header">
        <div>
          <h1 className="test-panel-title">Test Content Panel</h1>
          <p style={{ color: '#888', margin: 0, marginTop: 4 }}>Manage quizzes and test folders</p>
        </div>

        <div className="test-panel-actions">
          <Input
            prefix={<FiSearch className="text-gray-500" />}
            placeholder="Search folders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark-input"
            style={{ width: 240, borderRadius: 8 }}
          />
          <Button
            type="primary"
            icon={<FiPlus />}
            onClick={() => handleOpenModal()}
            size="middle"
            style={{ borderRadius: 8, fontWeight: 500 }}
          >
            New Folder
          </Button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="folders-grid">
          {[1, 2, 3, 4, 5, 6].map(i => <FolderSkeleton key={i} />)}
        </div>
      ) : filteredFolders.length > 0 ? (
        <div className="folders-grid">
          {filteredFolders.map((folder) => (
            <div
              key={folder._id}
              className="folder-card group"
              onClick={() => handleFolderClick(folder._id)}
            >
              <div className="folder-actions">
                <Dropdown overlay={renderFolderMenu(folder)} trigger={["click"]} placement="bottomRight">
                  <div className="p-2 hover:bg-gray-800 rounded-full transition-colors" onClick={e => e.stopPropagation()}>
                    <FiMoreVertical className="text-gray-400 text-lg" />
                  </div>
                </Dropdown>
              </div>

              <div className="folder-icon-wrapper">
                <FaFolder />
              </div>

              <div className="folder-info">
                <h3>{folder.name}</h3>
                <div className="folder-meta">
                  <span>{folder.courses?.length || 0} Courses</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${folder.isVisible ? 'bg-green-900/30 text-green-400' : 'bg-gray-800 text-gray-400'}`}>
                    {folder.isVisible ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <AiFillFolder size={64} className="mb-4 opacity-20" />
          <p>No folders found</p>
          {searchTerm && <Button type="link" onClick={() => setSearchTerm('')}>Clear Search</Button>}
        </div>
      )}

      {/* Modal */}
      <Modal
        title={editingFolder ? "Edit Folder" : "Create New Folder"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal} className="dark-button-secondary">
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddOrUpdateFolder}>
            {editingFolder ? "Save Changes" : "Create Folder"}
          </Button>,
        ]}
        wrapClassName="dark-modal"
      >
        <div className="flex flex-col gap-4 py-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Folder Name</label>
            <Input
              placeholder="Ex: Weekly Tests"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="dark-input"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Assign to Courses</label>
            <Select
              mode="multiple"
              placeholder="Select courses..."
              value={selectedCourses}
              onChange={(value) => setSelectedCourses(value)}
              className="w-full dark-select"
              popupClassName="dark-select-dropdown"
            >
              {courses.map((course) => (
                <Option key={course._id} value={course._id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default HOC(TestPanel);
