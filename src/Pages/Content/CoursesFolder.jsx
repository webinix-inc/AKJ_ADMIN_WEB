import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchCourses, updateCourse } from "../../redux/slices/courseSlice";
import { useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import { FaFolder, FaEdit, FaSave } from "react-icons/fa";
import { Modal, Input, Button } from "antd";
import HOC from "../../Component/HOC/HOC";
import { toast } from "react-toastify";

const CoursesFolder = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [updatedCourseName, setUpdatedCourseName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleFolderClick = (courseId) => {
    if (!editingCourseId) navigate(`/content/subjects/${courseId}`);
  };

  const handleEditClick = (e, course) => {
    e.stopPropagation(); // Prevents navigating when edit icon is clicked
    setEditingCourseId(course._id);
    setUpdatedCourseName(course.title);
  };

  const handleSaveEdit = async (e, courseId) => {
    e.stopPropagation(); // Prevents navigating when save icon is clicked
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
        <h2 className="text-white text-2xl font-bold">Course Folders</h2>
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
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course._id}
              className="flex flex-col items-center cursor-pointer transition-all transform hover:scale-105"
              onClick={() => handleFolderClick(course._id)}
            >
              <FaFolder size={70} className="text-blue-400" />{" "}
              {/* Light blue folder */}
              {editingCourseId === course._id ? (
                // Edit Mode
                <div className="flex items-center">
                  <Input
                    value={updatedCourseName}
                    onChange={(e) => setUpdatedCourseName(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevents navigation on input click
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
          <p>No courses available</p>
        )}
      </div>
    </div>
  );
};

export default HOC(CoursesFolder);
