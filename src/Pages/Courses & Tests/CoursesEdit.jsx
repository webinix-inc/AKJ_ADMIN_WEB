import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCourseById,
  updateCourse,
  deleteCourse,
  fetchAllCategories,
  fetchEnrollmentCount,
} from "../../redux/slices/courseSlice";
import { getSubscriptionsByCourseId } from "../../redux/slices/subscriptionSlice"; // Import the thunk for fetching subscriptions
import HOC from "../../Component/HOC/HOC";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Button, message, Upload, Select, Modal } from "antd";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import img from "../../Image/img9.png";
import {
  DeleteOutlined,
  PlayCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

const CoursesEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { course, enrollmentCount, loading, error, categories } = useSelector(
    (state) => state.courses
  );
  const { subscriptionsByCourse } = useSelector((state) => state.subscription); // State for subscription plans

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    discount: "",
    category: "",
    subCategory: "",
    courseDuration: "",
    enrolledStudents: "",
  });

  const [description, setDescription] = useState("");
  const [courseImage, setCourseImage] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [files, setFiles] = useState({ courseImage: [] });
  const [isEditMode, setIsEditMode] = useState(false); // State to toggle edit mode
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [videos, setVideos] = useState([]); // Holds the list of existing videos
  const [newVideos, setNewVideos] = useState([]); // Holds newly uploaded videos
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      dispatch(fetchEnrollmentCount(id));
      dispatch(getSubscriptionsByCourseId(id)); // Fetch subscriptions for the course
    }
    dispatch(fetchAllCategories());
  }, [dispatch, id]);

  useEffect(() => {
    if (course && categories.length > 0) {
      setFormData({
        title: course.title || "",
        price: course.price || "",
        discount: course.discount || "",
        category: course.category || "",
        subCategory: course.subCategory || "",
        courseDuration: course.duration || "",
        enrolledStudents: course.enrolledStudents || "",
      });
      setDescription(course.description.join("\n") || "");
      setCourseImage(course.courseImage?.[0] || img);
      setVideos(course.courseVideo || []);

      const selectedCategory = categories.find(
        (cat) => cat._id === course.category
      );
      setSubCategories(selectedCategory ? selectedCategory.subCategories : []);
    }
  }, [course, categories]);

  const handleEditModeToggle = () => setIsEditMode((prev) => !prev); // Toggle edit mode

  const handleCategoryChange = (value) => {
    setFormData((prevData) => ({
      ...prevData,
      category: value,
      subCategory: "",
    }));
    const selectedCategory = categories.find((cat) => cat._id === value);
    setSubCategories(selectedCategory ? selectedCategory.subCategories : []);
  };

  const handleDescriptionChange = (value) => setDescription(value);

  const handleSubmit = async () => {
    const updatedData = new FormData();
    updatedData.append("title", formData.title);
    updatedData.append("price", formData.price);
    updatedData.append("discount", formData.discount);
    updatedData.append("category", formData.category);
    updatedData.append("subCategory", formData.subCategory);
    updatedData.append("courseDuration", formData.courseDuration);
    updatedData.append("enrolledStudents", formData.enrolledStudents);
    updatedData.append("description", description);

    if (files.courseImage && files.courseImage.length > 0) {
      files.courseImage.forEach((file) => {
        updatedData.append("courseImage", file);
      });
    }

    try {
      await dispatch(updateCourse({ id, updatedData }));
      toast.success("Course updated successfully!");
      setIsEditMode(false); // Exit edit mode after saving
    } catch (error) {
      toast.error("Error updating course!");
    }
  };

  const handleDeleteCourse = () => {
    dispatch(deleteCourse(id))
      .then(() => {
        message.success("Course deleted successfully!");
        setDeleteConfirmModal(false);
        navigate("/courses_tests/courses");
      })
      .catch((error) => {
        message.error("Error deleting course: " + error.message);
      });
  };

  const handleDeleteModalOpen = () => {
    setDeleteConfirmModal(true);
  };

  const handleDeleteModalClose = () => {
    setDeleteConfirmModal(false);
  };

  const handleSubCategoryChange = (value) => {
    setFormData((prevData) => ({ ...prevData, subCategory: value }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };
  const handleImageChange = (info) => {
    const file = info.file && info.file.originFileObj;
    if (file) {
      setCourseImage(URL.createObjectURL(file));
      setFiles((prevFiles) => ({
        ...prevFiles,
        courseImage: [file],
      }));
    } else {
      message.error("Invalid file or no file selected");
    }
  };

  const playVideo = (url) => {
    setCurrentVideoUrl(url);
    // Optionally, manage the state to show/hide the video player modal
  };

  return (
    <div className="">
      {currentVideoUrl && (
        <Modal
          title="Play Video"
          visible={!!currentVideoUrl}
          onCancel={() => setCurrentVideoUrl("")}
          footer={null}
        >
          <video controls src={currentVideoUrl} style={{ width: "100%" }}>
            Your browser does not support the video tag.
          </video>
        </Modal>
      )}
      {/* Delete Confirmation Modal */}
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
      <div className="coursesEdit1">
        <FaArrowLeft
          color="#FFFFFF"
          size={20}
          onClick={() => navigate("/courses_tests/courses")}
        />
        <h6>{isEditMode ? "Edit Course" : "Course Details"}</h6>
      </div>

      <div className="coursesEdit2">
        <div className="coursesEdit3">
          <div className="image-container" style={{ position: "relative" }}>
            <img
              className="course-test8"
              src={courseImage || img}
              alt="Course"
              style={{ width: "100%", height: "auto", marginBottom: "10px" }}
            />
            {isEditMode && (
              <Upload
                onChange={handleImageChange}
                showUploadList={false}
                accept="image/*"
              >
                <Button icon={<UploadOutlined />}>Change Image</Button>
              </Upload>
            )}
          </div>

          <div className="coursesEdit5">
            <label>Title</label>
            {isEditMode ? (
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter Title"
                className="text-white"
              />
            ) : (
              <p>{formData.title}</p>
            )}
            {/* Students Enrolled Section */}
            <div className="courseEdit5">
              <label>Students Enrolled</label>
              <p>{enrollmentCount !== null ? enrollmentCount : "Loading..."}</p>
            </div>
            {/* Plans Section */}
            <div className="coursesEdit5">
              <label>Plans</label>
              {subscriptionsByCourse && subscriptionsByCourse.length > 0 ? (
                subscriptionsByCourse.map((planName, index) => (
                  <div className="courseEdit5 text-white" key={index}>
                    {planName}
                  </div>
                ))
              ) : (
                <p>No plans available</p>
              )}
            </div>
          </div>
          <div className="coursesEdit5">
            <label>Category</label>
            {isEditMode ? (
              <Select
                value={formData.category}
                onChange={handleCategoryChange}
                style={{ width: "100%" }}
                placeholder="Select Category"
              >
                {categories.map((cat) => (
                  <Select.Option key={cat._id} value={cat._id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              <p>
                {categories.find((cat) => cat._id === formData.category)
                  ?.name || "N/A"}
              </p>
            )}
            <div className="coursesEdit5">
              <label>Subcategory</label>
              {isEditMode ? (
                <Select
                  value={formData.subCategory}
                  onChange={handleSubCategoryChange}
                  style={{ width: "100%" }}
                  placeholder="Select Subcategory"
                >
                  {subCategories.map((subCat) => (
                    <Select.Option key={subCat._id} value={subCat._id}>
                      {subCat.name}
                    </Select.Option>
                  ))}
                </Select>
              ) : (
                <p>
                  {subCategories.find((sub) => sub._id === formData.subCategory)
                    ?.name || "N/A"}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="coursesEdit6">
          <h6 className="text-white">Course Description</h6>
          {isEditMode ? (
            <ReactQuill
              value={description}
              onChange={handleDescriptionChange}
              theme="snow"
              placeholder="Edit the course description..."
            />
          ) : (
            <div
              className="text-white"
              style={{
                background: "#333",
                padding: "10px",
                borderRadius: "5px",
              }}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )}
        </div>
        <div className="coursesEdit6">
          <h6 className="text-white">Course Videos</h6>
          {isEditMode ? (
            <>
              <Upload
                multiple
                beforeUpload={(file) => {
                  setNewVideos([...newVideos, file]);
                  return false; // Prevent automatic upload
                }}
                onRemove={(file) => {
                  setNewVideos(newVideos.filter((v) => v.uid !== file.uid));
                }}
              >
                <Button icon={<UploadOutlined />}>Add New Video</Button>
              </Upload>
              {newVideos.map((file) => (
                <div key={file.uid}>{file.name}</div>
              ))}
            </>
          ) : (
            videos.map((video, index) => (
              <div key={index} className="video-list-item">
                <div className="file-info">
                  <video
                    width="120" // Set a fixed width for the preview
                    height="60"
                    controls
                    src={video.url}
                    style={{ marginRight: "10px" }} // Add some spacing
                    onMouseOver={(event) => event.target.play()} // Play on hover
                    onMouseOut={(event) => {
                      event.target.pause(); // Pause when not hovering
                      event.target.currentTime = 0; // Rewind to start
                    }}
                    onClick={() => playVideo(video.url)} // Play full video on click
                  >
                    Your browser does not support the video tag.
                  </video>
                  <span className="file-name">{video.name}</span>
                </div>
                <div className="file-actions">
                  <Button
                    icon={<PlayCircleOutlined />}
                    onClick={() => playVideo(video.url)}
                  >
                    Play Full
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="coursesEdit7">
          {!isEditMode ? (
            <>
              <Button
                type="primary"
                onClick={handleEditModeToggle}
                style={{ marginRight: "10px" }}
              >
                Edit
              </Button>
              <Button type="danger" onClick={handleDeleteModalOpen}>
                Delete
              </Button>
            </>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "Updating..." : "Done"}
            </Button>
          )}
          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default HOC(CoursesEdit);
