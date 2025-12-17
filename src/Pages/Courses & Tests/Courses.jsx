import { Button, Form, Input, Modal, Select, message } from "antd";
import React, { useEffect, useState } from "react";
import { HiPlus } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import img5 from "../../Image/img30.png";
import {
  createCategory,
  fetchBatchCourses,
  fetchCourses,
} from "../../redux/slices/courseSlice";
import AddCourse from "./AddCourse";
import BatchCourseCard from "./BatchCourseCard";
import BatchCourseForm from "./BatchCourseForm";
import CourseCard from "./CourseCard"; // Import the new CourseCard component
import "./Courses_Tests.css";

const { Option } = Select;

const Courses = () => {
  const [modalShow, setModalShow] = useState(false);
  const [modalShow2, setModalShow2] = useState(false);
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("true");

  
  // Batch course states
  const [activeTab, setActiveTab] = useState("courses");
  const [batchCourseModalShow, setBatchCourseModalShow] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courses, batchCourses, loading, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
    dispatch(fetchBatchCourses());
  }, [dispatch]);

  const handleAddCourseModalOpen = () => {
    setModalShow(true);
  };

  const handleAddCourseModalClose = () => {
    setModalShow(false);
  };

  const handleCourseAddedSuccessModalClose = () => {
    setModalShow2(false);
  };

  const handleCategoryModalOpen = () => {
    setCategoryModalShow(true);
  };

  const handleCategoryModalClose = () => {
    setCategoryModalShow(false);
    setCategoryName("");
    setCategoryStatus("true");
  };

  const handleStatusSelect = (value) => {
    setCategoryStatus(value);
  };

  const handleCategorySubmit = () => {
    if (categoryName && categoryStatus) {
      dispatch(
        createCategory({
          name: categoryName,
          status: categoryStatus,
        })
      )
        .then(() => {
          message.success("Category added successfully!");
          handleCategoryModalClose();
        })
        .catch((error) => {
          message.error("Error adding category: " + error.message);
        });
    } else {
      message.error("Please fill in all fields before submitting.");
    }
  };



  // Batch course handlers
  const handleAddBatchCourseModalOpen = () => {
    setBatchCourseModalShow(true);
  };

  const handleAddBatchCourseModalClose = () => {
    setBatchCourseModalShow(false);
  };

  const handleBatchCourseSuccess = () => {
    dispatch(fetchBatchCourses());
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const refreshBatchCourses = () => {
    dispatch(fetchBatchCourses());
  };

  const refreshCourses = () => {
    dispatch(fetchCourses());
  };

  return (
    <>
      <AddCourse modalShow={modalShow} onHide={handleAddCourseModalClose} />
      <BatchCourseForm
        visible={batchCourseModalShow}
        onCancel={handleAddBatchCourseModalClose}
        onSuccess={handleBatchCourseSuccess}
      />

      <Modal
        title="Course Added Successfully"
        open={modalShow2}
        onCancel={handleCourseAddedSuccessModalClose}
        centered
        footer={null}
      >
        <div className="courseaddedsucc">
          <img src={img5} alt="" />
          <p>Course Added Successfully</p>
        </div>
      </Modal>

      <Modal
        title="Add New Category"
        open={categoryModalShow}
        onCancel={handleCategoryModalClose}
        centered
        footer={[
          <Button key="cancel" onClick={handleCategoryModalClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCategorySubmit}>
            Add Category
          </Button>,
        ]}
      >
        <Form layout="vertical" onFinish={handleCategorySubmit}>
          <Form.Item
            label="Category Name"
            name="categoryName"
            rules={[{ required: true, message: "Please enter category name" }]}
          >
            <Input
              placeholder="Enter category name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
          </Form.Item>
          <Form.Item
            label="Category Status"
            name="categoryStatus"
            rules={[{ required: true, message: "Please select category status" }]}
          >
            <Select
              placeholder="Select status"
              onChange={handleStatusSelect}
              value={categoryStatus}
            >
              <Option value="true">True</Option>
              <Option value="false">False</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>



      <div className="course-test px-4 py-1">
        <div className="course-test1">
          <div className="course-test2">
            {/* Custom Tab Interface with Action Buttons */}
            <div className="tab-container flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="tab-buttons">
                <button
                  className={`tab-button ${activeTab === "courses" ? "active" : ""}`}
                  onClick={() => handleTabChange("courses")}
                >
                  Courses
                </button>
                <button
                  className={`tab-button ${activeTab === "batches" ? "active" : ""}`}
                  onClick={() => handleTabChange("batches")}
                >
                  Batches
                </button>
                <button
                  className={`tab-button ${activeTab === "freevideo" ? "active" : ""}`}
                  onClick={() => handleTabChange("freevideo")}
                >
                  Free Videos
                </button>
              </div>

              {/* Action Buttons on the Right */}
              <div className="action-buttons">
                {activeTab === "courses" && (
                  <button
                    className="action-button bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddCourseModalOpen}
                  >
                    <HiPlus size={16} /> Add New Course
                  </button>
                )}
                {activeTab === "batches" && (
                  <button
                    className="action-button bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleAddBatchCourseModalOpen}
                  >
                    <HiPlus size={16} /> Add Batch Course
                  </button>
                )}
                {activeTab === "freevideo" && (
                  <button
                    className="action-button bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate("/courses_tests/freeVideo")}
                  >
                    <HiPlus size={16} /> Manage Free Videos
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content mt-2">
              {activeTab === "courses" && (
                <div className="courses-content">
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                        {loading ? (
                          <div className="col-span-full flex justify-center items-center py-8">
                            <div className="text-white">Loading courses...</div>
                          </div>
                        ) : error ? (
                          <div className="col-span-full flex justify-center items-center py-8">
                            <p className="error text-red-500">{error}</p>
                          </div>
                        ) : (() => {
                          const regularCourses = courses.filter((course) => course.courseType !== "Batch");
                          return regularCourses.length > 0 ? (
                            regularCourses.map((course) => (
                              <CourseCard
                                key={course?._id}
                                course={course}
                                onRefresh={refreshCourses}
                              />
                            ))
                          ) : (
                            <div className="col-span-full flex justify-center items-center py-12">
                              <div className="text-center text-gray-400">
                                <div className="text-6xl mb-4">📚</div>
                                <p className="text-lg">No courses available</p>
                                <p className="text-sm mt-2">Click "Add New Course" to get started</p>
                              </div>
                            </div>
                          );
                        })()}
                  </div>
                </div>
              )}

              {activeTab === "batches" && (
                <div className="batches-content">
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {loading ? (
                          <div className="col-span-full flex justify-center items-center py-8">
                            <div className="text-white">Loading batch courses...</div>
                          </div>
                        ) : error ? (
                          <div className="col-span-full flex justify-center items-center py-8">
                            <p className="error text-red-500">{error}</p>
                          </div>
                        ) : batchCourses && batchCourses.length > 0 ? (
                          batchCourses.map((course) => (
                            <BatchCourseCard
                              key={course._id}
                              course={course}
                              onRefresh={refreshBatchCourses}
                            />
                          ))
                        ) : (
                          <div className="col-span-full flex justify-center items-center py-12">
                            <div className="text-center text-gray-400">
                              <div className="text-6xl mb-4">🎓</div>
                              <p className="text-lg">No batch courses available</p>
                              <p className="text-sm mt-2">Click "Add Batch Course" to get started</p>
                            </div>
                          </div>
                        )}
                  </div>
                </div>
              )}

              {activeTab === "freevideo" && (
                <div className="freevideo-content">
                  <div className="free-video-tab">
                    <div className="text-center py-12">
                      <div className="text-gray-500 mb-4 text-6xl">
                        📹
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-4">
                        Free Video Management
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Click "Manage Free Videos" button above to manage your free video content
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HOC(Courses);