import { Editor } from "@tinymce/tinymce-react";
import { Button, message, Modal, Select, Upload, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  UploadOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  UserOutlined,
  BookOutlined,
  QuestionCircleOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import HOC from "../../Component/HOC/HOC";
import {
  deleteCourse,
  fetchAllCategories,
  fetchCourseById,
  fetchEnrollmentCount,
  updateCourse,
} from "../../redux/slices/courseSlice";
import { getSubscriptionsByCourseId } from "../../redux/slices/subscriptionSlice";
import { getOptimizedCourseImage, handleImageError } from "../../utils/imageUtils";
import { Input } from "antd";
import api from "../../api/axios";

// Styles
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '32px',
  },
  backBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: '#262626',
    border: '1px solid #404040',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: '#fff',
    transition: 'all 0.2s',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#fafafa',
  },
  editBadge: {
    padding: '4px 12px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
    background: '#3b82f620',
    color: '#3b82f6',
    border: '1px solid #3b82f640',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '24px',
  },
  card: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #262626',
  },
  cardTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    color: '#fafafa',
  },
  cardIcon: {
    fontSize: '18px',
    color: '#3b82f6',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    background: '#262626',
  },
  image: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#a3a3a3',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    height: '44px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#262626',
    color: '#fafafa',
    padding: '0 14px',
    fontSize: '14px',
    outline: 'none',
  },
  value: {
    fontSize: '15px',
    color: '#fafafa',
    margin: 0,
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#22c55e',
    margin: 0,
  },
  planBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    borderRadius: '6px',
    background: '#3b82f620',
    color: '#60a5fa',
    fontSize: '13px',
    fontWeight: '500',
    marginRight: '8px',
    marginBottom: '8px',
  },
  descriptionBox: {
    background: '#262626',
    borderRadius: '8px',
    padding: '16px',
    color: '#d4d4d4',
    fontSize: '14px',
    lineHeight: '1.6',
  },
  faqItem: {
    background: '#262626',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '12px',
  },
  faqQuestion: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fafafa',
    marginBottom: '8px',
  },
  faqAnswer: {
    fontSize: '13px',
    color: '#a3a3a3',
    margin: 0,
    paddingLeft: '16px',
    borderLeft: '2px solid #3b82f6',
  },
  videoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: '#262626',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '12px',
  },
  videoThumb: {
    width: '120px',
    height: '70px',
    borderRadius: '6px',
    objectFit: 'cover',
    background: '#171717',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    marginTop: '32px',
    justifyContent: 'flex-end',
  },
  btnPrimary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#3b82f6',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #ef4444',
    background: 'transparent',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  btnSecondary: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '8px',
    border: '1px solid #404040',
    background: '#262626',
    color: '#d4d4d4',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

const CoursesEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { course, enrollmentCount, loading, error, categories } = useSelector(
    (state) => state.courses
  );
  const { subscriptionsByCourse } = useSelector((state) => state.subscription);

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
  const [isEditMode, setIsEditMode] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [videos, setVideos] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [faqLoading, setFaqLoading] = useState(false);

  const fetchFAQs = useCallback(async (courseId) => {
    setFaqLoading(true);
    try {
      const response = await api.get(`/admin/faqs/${courseId}`);
      const faqData = response.data?.data || response.data || [];
      if (Array.isArray(faqData) && faqData.length > 0) {
        setFaqs(faqData.map(faq => ({
          question: faq.question || "",
          answer: faq.answer || "",
          _id: faq._id
        })));
      } else {
        setFaqs([{ question: "", answer: "" }]);
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      setFaqs([{ question: "", answer: "" }]);
    } finally {
      setFaqLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
      dispatch(fetchEnrollmentCount(id));
      dispatch(getSubscriptionsByCourseId(id));
      fetchFAQs(id);
    }
    dispatch(fetchAllCategories());
  }, [dispatch, id, fetchFAQs]);

  useEffect(() => {
    if (course && categories.length > 0) {
      const descRaw = course.description;
      const descHtml = Array.isArray(descRaw)
        ? descRaw.map((line) => `<p>${line}</p>`).join("")
        : typeof descRaw === "string"
          ? descRaw
          : "";

      setDescription(descHtml);
      setFormData({
        title: course.title || "",
        price: course.price || "",
        discount: course.discount || "",
        category: course.category || "",
        subCategory: course.subCategory || "",
        courseDuration: course.duration || "",
        enrolledStudents: course.enrolledStudents || "",
      });

      setCourseImage(getOptimizedCourseImage(course));
      setVideos(course.courseVideo || []);

      const selectedCategory = categories.find(
        (cat) => cat._id === course.category
      );
      setSubCategories(selectedCategory ? selectedCategory.subCategories : []);
    }
  }, [course, categories]);

  const handleCategoryChange = (value) => {
    setFormData((prev) => ({ ...prev, category: value, subCategory: "" }));
    const selectedCategory = categories.find((cat) => cat._id === value);
    setSubCategories(selectedCategory ? selectedCategory.subCategories : []);
  };

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));
  const handleFaqChange = (index, key, value) => {
    const updated = [...faqs];
    updated[index][key] = value;
    setFaqs(updated);
  };

  const handleSubmit = async () => {
    const updatedData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      updatedData.append(key, value);
    });
    updatedData.append("description", description);

    if (files.courseImage?.length > 0) {
      files.courseImage.forEach((file) => updatedData.append("courseImage", file));
    }

    try {
      await dispatch(updateCourse({ id, updatedData })).unwrap();

      // Handle FAQs
      try {
        const existingFaqIds = faqs.filter(faq => faq._id).map(faq => faq._id);
        if (existingFaqIds.length > 0) {
          await Promise.all(existingFaqIds.map(faqId => api.delete(`/admin/faqs/${faqId}`)));
        }

        const validFaqs = faqs.filter(
          faq => faq.question?.trim() && faq.answer?.trim()
        );

        if (validFaqs.length > 0) {
          await api.post("/admin/faqs", {
            faqs: validFaqs.map(faq => ({
              course: id,
              question: faq.question.trim(),
              answer: faq.answer.trim(),
              category: "General"
            })),
            courseId: id
          });
        }
      } catch (faqError) {
        console.error("Error updating FAQs:", faqError);
        toast.warning("Course updated but FAQs had an error");
      }

      toast.success("Course updated successfully!");
      await dispatch(fetchCourseById(id));
      await fetchFAQs(id);
      setIsEditMode(false);
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error(error || "Error updating course!");
    }
  };

  const handleDeleteCourse = () => {
    dispatch(deleteCourse(id))
      .then(() => {
        message.success("Course deleted successfully!");
        setDeleteConfirmModal(false);
        navigate("/courses_tests/courses");
      })
      .catch((err) => message.error("Error: " + err.message));
  };

  const handleImageChange = (info) => {
    const file = info.file?.originFileObj;
    if (file) {
      setCourseImage(URL.createObjectURL(file));
      setFiles((prev) => ({ ...prev, courseImage: [file] }));
    }
  };

  if (!course && loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Video Modal */}
      <Modal
        title="Play Video"
        open={!!currentVideoUrl}
        onCancel={() => setCurrentVideoUrl("")}
        footer={null}
        width={800}
      >
        <video controls src={currentVideoUrl} style={{ width: "100%" }} />
      </Modal>

      {/* Delete Modal */}
      <Modal
        title={null}
        open={deleteConfirmModal}
        onCancel={() => setDeleteConfirmModal(false)}
        footer={null}
        centered
        width={400}
        styles={{
          content: {
            background: '#1a1a1a',
            borderRadius: '16px',
            border: '1px solid #333',
            padding: '24px',
          },
          mask: {
            background: 'rgba(0,0,0,0.7)',
          }
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <span style={{ fontSize: '28px' }}>🗑️</span>
          </div>
          <h3 style={{
            color: '#fff',
            fontSize: '18px',
            fontWeight: '600',
            margin: '0 0 8px 0',
          }}>Delete Course</h3>
          <p style={{
            color: '#a3a3a3',
            fontSize: '14px',
            margin: '0 0 24px 0',
            lineHeight: '1.5',
          }}>
            Are you sure you want to delete "<strong style={{ color: '#fff' }}>{formData.title}</strong>"?
            This action cannot be undone.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
              onClick={() => setDeleteConfirmModal(false)}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: '1px solid #404040',
                background: '#262626',
                color: '#d4d4d4',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteCourse}
              style={{
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                background: '#ef4444',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.backBtn} onClick={() => navigate("/courses_tests/courses")}>
          <ArrowLeftOutlined />
        </div>
        <h1 style={styles.title}>{isEditMode ? "Edit Course" : "Course Details"}</h1>
        {isEditMode && <span style={styles.editBadge}>Editing</span>}
      </div>

      {/* Main Content */}
      <div style={{ ...styles.grid, gridTemplateColumns: window.innerWidth > 768 ? '350px 1fr' : '1fr' }}>
        {/* Left Column */}
        <div>
          {/* Image Card */}
          <div style={styles.card}>
            <div style={styles.imageContainer}>
              <img
                src={courseImage || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="200"%3E%3Crect fill="%23262626" width="400" height="200"/%3E%3C/svg%3E'}
                alt="Course"
                style={styles.image}
                onError={handleImageError}
              />
            </div>
            {isEditMode && (
              <Upload onChange={handleImageChange} showUploadList={false} accept="image/*">
                <Button icon={<UploadOutlined />} style={{ marginTop: '12px', width: '100%' }}>
                  Change Image
                </Button>
              </Upload>
            )}
          </div>

          {/* Stats Card */}
          <div style={{ ...styles.card, marginTop: '16px' }}>
            <div style={styles.cardHeader}>
              <UserOutlined style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Statistics</h3>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Students Enrolled</label>
              <p style={styles.statValue}>{enrollmentCount ?? 0}</p>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Subscription Plans</label>
              <div>
                {subscriptionsByCourse?.length > 0 ? (
                  subscriptionsByCourse.map((plan, i) => (
                    <span key={i} style={styles.planBadge}>{plan}</span>
                  ))
                ) : (
                  <p style={{ ...styles.value, color: '#737373' }}>No plans</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          {/* Basic Info Card */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <BookOutlined style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Basic Information</h3>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Title</label>
              {isEditMode ? (
                <input
                  style={styles.input}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Course title"
                />
              ) : (
                <p style={styles.value}>{formData.title}</p>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                {isEditMode ? (
                  <Select
                    value={formData.category}
                    onChange={handleCategoryChange}
                    style={{ width: "100%" }}
                    placeholder="Select"
                  >
                    {categories.map((cat) => (
                      <Select.Option key={cat._id} value={cat._id}>{cat.name}</Select.Option>
                    ))}
                  </Select>
                ) : (
                  <p style={styles.value}>
                    {categories.find(c => c._id === formData.category)?.name || "N/A"}
                  </p>
                )}
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Subcategory</label>
                {isEditMode ? (
                  <Select
                    value={formData.subCategory}
                    onChange={(v) => setFormData({ ...formData, subCategory: v })}
                    style={{ width: "100%" }}
                    placeholder="Select"
                  >
                    {subCategories.map((sub) => (
                      <Select.Option key={sub._id} value={sub._id}>{sub.name}</Select.Option>
                    ))}
                  </Select>
                ) : (
                  <p style={styles.value}>
                    {subCategories.find(s => s._id === formData.subCategory)?.name || "N/A"}
                  </p>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Discount (%)</label>
              {isEditMode ? (
                <input
                  style={styles.input}
                  value={formData.discount}
                  onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                  placeholder="0%"
                />
              ) : (
                <p style={styles.value}>{formData.discount || 0}%</p>
              )}
            </div>


          </div>

          {/* Description Card */}
          <div style={{ ...styles.card, marginTop: '16px' }}>
            <div style={styles.cardHeader}>
              <BookOutlined style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>Description</h3>
            </div>
            {isEditMode ? (
              <Editor
                apiKey="twwx4pwak114eiqavytggyqmzzo0oohnd2lac1haaz597b3a"
                value={description}
                init={{
                  height: 300,
                  menubar: false,
                  plugins: ["link", "lists", "code", "paste"],
                  toolbar: "undo redo | bold italic underline | bullist numlist | link | code",
                  content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
                onEditorChange={setDescription}
              />
            ) : (
              <div style={styles.descriptionBox} dangerouslySetInnerHTML={{ __html: description }} />
            )}
          </div>

          {/* FAQs Card */}
          <div style={{ ...styles.card, marginTop: '16px' }}>
            <div style={styles.cardHeader}>
              <QuestionCircleOutlined style={styles.cardIcon} />
              <h3 style={styles.cardTitle}>FAQs</h3>
            </div>
            {faqLoading ? (
              <Spin />
            ) : isEditMode ? (
              <>
                {faqs.map((faq, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <Input
                      placeholder="Question"
                      value={faq.question}
                      onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <Input
                      placeholder="Answer"
                      value={faq.answer}
                      onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <MinusCircleOutlined
                      onClick={() => removeFaq(index)}
                      style={{ color: "#ef4444", fontSize: "20px", cursor: "pointer" }}
                    />
                  </div>
                ))}
                <Button type="dashed" icon={<PlusOutlined />} onClick={addFaq}>
                  Add FAQ
                </Button>
              </>
            ) : faqs.some(f => f.question?.trim()) ? (
              faqs.filter(f => f.question?.trim()).map((faq, i) => (
                <div key={i} style={styles.faqItem}>
                  <p style={styles.faqQuestion}>Q: {faq.question}</p>
                  <p style={styles.faqAnswer}>A: {faq.answer}</p>
                </div>
              ))
            ) : (
              <p style={{ color: '#737373' }}>No FAQs available</p>
            )}
          </div>


        </div>
      </div>

      {/* Action Buttons */}
      <div style={styles.actions}>
        {!isEditMode ? (
          <>
            <button style={styles.btnPrimary} onClick={() => setIsEditMode(true)}>
              <EditOutlined /> Edit Course
            </button>
            <button style={styles.btnDanger} onClick={() => setDeleteConfirmModal(true)}>
              <DeleteOutlined /> Delete
            </button>
          </>
        ) : (
          <>
            <button style={styles.btnSecondary} onClick={() => setIsEditMode(false)}>
              Cancel
            </button>
            <button style={styles.btnPrimary} onClick={handleSubmit} disabled={loading}>
              <SaveOutlined /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </>
        )}
      </div>

      {error && <p style={{ color: '#ef4444', textAlign: 'center', marginTop: '16px' }}>{error}</p>}
    </div>
  );
};

export default HOC(CoursesEdit);
