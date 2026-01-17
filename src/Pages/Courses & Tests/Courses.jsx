import { Button, Form, Input, Modal, Select, message } from "antd";
import React, { useEffect, useState, lazy, Suspense, memo, useCallback } from "react";
import { HiPlus } from "react-icons/hi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import {
  createCategory,
  fetchBatchCourses,
  fetchCourses,
} from "../../redux/slices/courseSlice";
import "./Courses_Tests.css";

// Lazy load heavy components
const AddCourse = lazy(() => import("./AddCourse"));
const BatchCourseForm = lazy(() => import("./BatchCourseForm"));
const CourseCard = lazy(() => import("./CourseCard"));
const BatchCourseCard = lazy(() => import("./BatchCourseCard"));

const { Option } = Select;

// Skeleton card for loading state
const SkeletonCard = memo(() => (
  <div className="skeleton-card">
    <div className="skeleton-image"></div>
    <div className="skeleton-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-text"></div>
      <div className="skeleton-text skeleton-text-short"></div>
    </div>
  </div>
));

// Loading grid with skeleton cards
const LoadingGrid = memo(({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
));

// Empty state component
const EmptyState = memo(({ icon, title, description }) => (
  <div className="empty-state-container">
    <div className="empty-state-icon">{icon}</div>
    <p className="empty-state-title">{title}</p>
    <p className="empty-state-description">{description}</p>
  </div>
));

// Tab button component
const TabButton = memo(({ active, label, onClick }) => (
  <button
    className={`tab-button ${active ? "active" : ""}`}
    onClick={onClick}
  >
    {label}
  </button>
));

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

  const handleAddCourseModalOpen = useCallback(() => setModalShow(true), []);
  const handleAddCourseModalClose = useCallback(() => setModalShow(false), []);
  const handleCourseAddedSuccessModalClose = useCallback(() => setModalShow2(false), []);

  const handleCategoryModalClose = useCallback(() => {
    setCategoryModalShow(false);
    setCategoryName("");
    setCategoryStatus("true");
  }, []);

  const handleStatusSelect = useCallback((value) => setCategoryStatus(value), []);

  const handleCategorySubmit = useCallback(() => {
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
  }, [categoryName, categoryStatus, dispatch, handleCategoryModalClose]);

  const handleAddBatchCourseModalOpen = useCallback(() => setBatchCourseModalShow(true), []);
  const handleAddBatchCourseModalClose = useCallback(() => setBatchCourseModalShow(false), []);
  const handleBatchCourseSuccess = useCallback(() => dispatch(fetchBatchCourses()), [dispatch]);
  const handleTabChange = useCallback((key) => setActiveTab(key), []);
  const refreshBatchCourses = useCallback(() => dispatch(fetchBatchCourses()), [dispatch]);
  const refreshCourses = useCallback(() => dispatch(fetchCourses()), [dispatch]);

  // Filter regular courses (not batch type)
  const regularCourses = courses?.filter((course) => course.courseType !== "Batch") || [];

  return (
    <>
      {/* Lazy loaded modals */}
      <Suspense fallback={null}>
        {modalShow && <AddCourse modalShow={modalShow} onHide={handleAddCourseModalClose} />}
      </Suspense>

      <Suspense fallback={null}>
        {batchCourseModalShow && (
          <BatchCourseForm
            visible={batchCourseModalShow}
            onCancel={handleAddBatchCourseModalClose}
            onSuccess={handleBatchCourseSuccess}
          />
        )}
      </Suspense>

      {/* Success Modal */}
      <Modal
        title="Course Added Successfully"
        open={modalShow2}
        onCancel={handleCourseAddedSuccessModalClose}
        centered
        footer={null}
      >
        <div className="courseaddedsucc">
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <p>Course Added Successfully</p>
        </div>
      </Modal>

      {/* Category Modal */}
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

      <div className="course-test">
        <div className="course-test1">
          <div className="course-test2">
            {/* Tab Navigation */}
            <div className="tab-container">
              <div className="tab-buttons">
                <TabButton
                  active={activeTab === "courses"}
                  label="📚 Courses"
                  onClick={() => handleTabChange("courses")}
                />
                <TabButton
                  active={activeTab === "batches"}
                  label="🎓 Batches"
                  onClick={() => handleTabChange("batches")}
                />
                <TabButton
                  active={activeTab === "freevideo"}
                  label="🎬 Free Videos"
                  onClick={() => handleTabChange("freevideo")}
                />
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                {activeTab === "courses" && (
                  <button
                    className="action-button bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddCourseModalOpen}
                  >
                    <HiPlus size={16} /> Add Course
                  </button>
                )}
                {activeTab === "batches" && (
                  <button
                    className="action-button bg-purple-600 hover:bg-purple-700 text-white"
                    onClick={handleAddBatchCourseModalOpen}
                  >
                    <HiPlus size={16} /> Add Batch
                  </button>
                )}
                {activeTab === "freevideo" && (
                  <button
                    className="action-button bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => navigate("/courses_tests/freeVideo")}
                  >
                    <HiPlus size={16} /> Manage Videos
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Courses Tab */}
              {activeTab === "courses" && (
                <div className="courses-content">
                  {loading ? (
                    <LoadingGrid count={8} />
                  ) : error ? (
                    <div className="empty-state-container">
                      <div className="empty-state-icon">⚠️</div>
                      <p className="empty-state-title text-red-500">{error}</p>
                    </div>
                  ) : regularCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                      <Suspense fallback={<SkeletonCard />}>
                        {regularCourses.map((course, index) => (
                          <CourseCard
                            key={course?._id}
                            course={course}
                            index={index}
                            onRefresh={refreshCourses}
                          />
                        ))}
                      </Suspense>
                    </div>
                  ) : (
                    <EmptyState
                      icon="📚"
                      title="No courses available"
                      description='Click "Add Course" to get started'
                    />
                  )}
                </div>
              )}

              {/* Batches Tab */}
              {activeTab === "batches" && (
                <div className="batches-content">
                  {loading ? (
                    <LoadingGrid count={6} />
                  ) : error ? (
                    <div className="empty-state-container">
                      <div className="empty-state-icon">⚠️</div>
                      <p className="empty-state-title text-red-500">{error}</p>
                    </div>
                  ) : batchCourses && batchCourses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      <Suspense fallback={<SkeletonCard />}>
                        {batchCourses.map((course) => (
                          <BatchCourseCard
                            key={course._id}
                            course={course}
                            onRefresh={refreshBatchCourses}
                          />
                        ))}
                      </Suspense>
                    </div>
                  ) : (
                    <EmptyState
                      icon="🎓"
                      title="No batch courses available"
                      description='Click "Add Batch" to get started'
                    />
                  )}
                </div>
              )}

              {/* Free Videos Tab */}
              {activeTab === "freevideo" && (
                <div className="freevideo-content">
                  <div className="free-video-tab">
                    <EmptyState
                      icon="🎬"
                      title="Free Video Management"
                      description='Click "Manage Videos" to manage your free video content'
                    />
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