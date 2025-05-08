import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Courses_Tests.css";
import HOC from "../../Component/HOC/HOC";
import { useNavigate } from "react-router-dom";
import {
  fetchCourses,
  createCategory,
  deleteCourse,
  updateCourseStatus,
} from "../../redux/slices/courseSlice";
import { HiPlus } from "react-icons/hi";
import { Modal, Button, Form, Input, Select, message, Card } from "antd";
import img from "../../Image/img9.png";
import img5 from "../../Image/img30.png";
import AddCourse from "./AddCourse";
import CourseActions from "./CourseActions"; // Import the new component

const { Option } = Select;

const Courses = () => {
  const [modalShow, setModalShow] = useState(false);
  const [modalShow2, setModalShow2] = useState(false);
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryStatus, setCategoryStatus] = useState("true");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { courses, loading, error } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
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

  const handleDeleteCourse = () => {
    dispatch(deleteCourse(selectedCourseId))
      .then(() => {
        message.success("Course deleted successfully!");
        setDeleteConfirmModal(false);
      })
      .catch((error) => {
        message.error("Error deleting course: " + error.message);
      });
  };

  const handleDeleteModalOpen = (courseId) => {
    setSelectedCourseId(courseId);
    setDeleteConfirmModal(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteConfirmModal(false);
    setSelectedCourseId(null);
  };

  const handleTogglePublish = (courseId, isPublished) => {
    dispatch(updateCourseStatus({ id: courseId, isPublished }))
      .then(() => {
        message.success(
          `Course successfully ${isPublished ? "published" : "unpublished"}!`
        );
      })
      .catch((error) => {
        message.error("Error updating course status: " + error.message);
      });
  };

  const handleCardClick=(e,id)=>{
    navigate(`/courses_tests/courses/edit/${id}`)
  }

  return (
    <>
      <AddCourse modalShow={modalShow} onHide={handleAddCourseModalClose} />

      <Modal
        title="Course Added Successfully"
        visible={modalShow2}
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
        visible={categoryModalShow}
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

      <Modal
        title="Confirm Deletion"
        visible={deleteConfirmModal}
        onCancel={handleDeleteModalClose}
        centered
        footer={[
          <Button key="cancel" onClick={handleDeleteModalClose}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            danger
            onClick={handleDeleteCourse}
          >
            Delete
          </Button>,
        ]}
      >
        <p>Are you sure you want to delete this course?</p>
      </Modal>

      <div className="course-test px-4 py-6">
        <div className="course-test1">
          <div className="course-test2">
            <div className="course-test3 flex justify-between items-center">
              <div className="course-test4">
                <h6 className="text-xl font-semibold">Courses</h6>
              </div>
              <div
                className="course-test5"
                onClick={() => navigate("/courses_tests/freeVideo")}
              >
                <h6>Free Video</h6>
              </div>
            </div>
            <div className="course-test6 flex gap-4 mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                onClick={handleAddCourseModalOpen}
              >
                <HiPlus color="#FFFFFF" size={20} /> Add New Course
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p className="error">{error}</p>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <Card
                  key={course?._id}
                  hoverable
                  cover={
                    <div className="overflow-hidden rounded-3xl">
                      <img
                        alt="example"
                        src={course?.courseImage || img}
                        className="object-contain h-full w-full"
                      />
                    </div>
                  }
                  className="shadow-lg flex flex-col justify-between h-full"
                  onClick={(e) =>
                    handleCardClick(e,course._id)
                  }
                >
                  <div className="flex flex-col justify-between space-y-2 mt-4">
                    <h6 className="text-lg font-semibold">
                      {course?.title}
                    </h6>
                    <div className="flex justify-between">
                    <p className="text-gray-600 mb-1">
                      Start Date:{" "}
                      {new Date(course?.startDate).toLocaleDateString()}
                    </p>
                    <CourseActions
                      courseId={course?._id}
                      isPublished={course?.isPublished}
                      onTogglePublish={handleTogglePublish}
                      onDelete={handleDeleteModalOpen}
                    />
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <p className="no-course">No courses available</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HOC(Courses);