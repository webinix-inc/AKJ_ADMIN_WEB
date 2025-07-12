import React, { useState, useEffect } from "react";
import { AiFillFolder } from "react-icons/ai";
import { FiMoreVertical } from "react-icons/fi";
import { FaTrashAlt, FaEdit } from "react-icons/fa";
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
} from "antd";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";

const { Option } = Select;
const { confirm } = Modal;

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

  const fetchFolders = async () => {
    try {
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
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/admin/courses");
      setCourses(response.data.data);
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch courses.");
    }
  };

  useEffect(() => {
    fetchFolders();
    fetchCourses();
  }, []);

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

  const confirmDelete = (id) => {
    confirm({
      title: "Are you sure you want to delete this folder?",
      content: "This action cannot be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => handleDeleteFolder(id),
    });
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

  const handleToggleVisibility = async (folder) => {
    try {
      const updatedVisibility = !folder.isVisible;
      await api.patch(`/testPanel/folders/${folder._id}`, {
        isVisible: updatedVisibility,
      });
      fetchFolders();
      message.success(
        `Folder visibility updated to ${
          updatedVisibility ? "Visible" : "Not Visible"
        }.`
      );
    } catch (error) {
      console.error("Error updating folder visibility:", error);
      message.error("Failed to update visibility.");
    }
  };

  const renderFolderMenu = (folder) => (
    <Menu>
      <Menu.Item onClick={() => handleOpenModal(folder)}>
        <FaEdit className="mr-2" />
        Edit
      </Menu.Item>
      <Menu.Item danger onClick={() => confirmDelete(folder._id)}>
        <FaTrashAlt className="mr-2" />
        Delete
      </Menu.Item>
      <Menu.Item>
        <div className="flex items-center justify-between">
          <span>Visible</span>
          <Switch
            checked={folder.isVisible}
            onChange={() => handleToggleVisibility(folder)}
            size="small"
          />
        </div>
      </Menu.Item>
    </Menu>
  );

  const handleFolderClick = (folderId) => {
    navigate(`/content/testpanel/${folderId}`);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6"
      style={{ backgroundColor: "#141414", color: "#fff" }}>
      <div className="w-full max-w-5xl">
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-4">
          <h1 className="text-lg font-semibold">Test Content</h1>
          <div className="flex space-x-4">
            <Input
              placeholder="Search folders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-60"
            />
            <Button type="primary" onClick={() => handleOpenModal()}>
              + New Folder
            </Button>
          </div>
        </div>

        {/* Folders Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredFolders.map((folder) => (
            <div
              key={folder._id}
              className="flex flex-col items-center p-4 bg-gray-800 border border-gray-700 rounded-lg shadow hover:shadow-lg transition">
              {/* Folder Icon - Triggers Navigation */}
              <AiFillFolder
                className="text-[#1a85ff] text-7xl mb-2 cursor-pointer"
                onClick={() => handleFolderClick(folder._id)}
              />

              {/* Name and Menu in a Single Row with Minimal Gap */}
              <div className="flex items-center w-full justify-center">
                {/* Folder Name - Triggers Navigation */}
                <p
                  className="text-gray-300 text-sm font-medium cursor-pointer"
                  onClick={() => handleFolderClick(folder._id)}>
                  {folder.name}
                </p>

                {/* Dropdown Menu */}
                <Dropdown
                  overlay={renderFolderMenu(folder)}
                  trigger={["click"]}
                  placement="bottomRight">
                  <FiMoreVertical className="cursor-pointer text-gray-500 hover:text-gray-300 ml-1 -mt-3" />
                </Dropdown>
              </div>

              {/* Folder Courses */}
              <p className="text-gray-500 text-xs mt-1">
                {folder.courses.length > 0
                  ? folder.courses.map((course) => course.title).join(", ")
                  : "No courses assigned"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Creating/Editing Folder */}
      <Modal
        title={editingFolder ? "Edit Folder" : "Create New Folder"}
        visible={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddOrUpdateFolder}>
            {editingFolder ? "Save Changes" : "Create"}
          </Button>,
        ]}>
        <div className="w-full">
          <label
            htmlFor="folderName"
            className="block text-sm font-medium text-gray-700 mb-1">
            Folder Name
          </label>
          <Input
            id="folderName"
            type="text"
            placeholder="Enter folder name"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="mb-4"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="assignCourses"
            className="block text-sm font-medium text-gray-700 mb-1">
            Assign to the Course
          </label>
          <Select
            id="assignCourses"
            mode="multiple"
            placeholder="Assign Courses (optional)"
            value={selectedCourses}
            onChange={(value) => setSelectedCourses(value)}
            className="w-full">
            {courses.map((course) => (
              <Option key={course._id} value={course._id}>
                {course.title}
              </Option>
            ))}
          </Select>
        </div>
      </Modal>
    </div>
  );
};

export default HOC(TestPanel);
