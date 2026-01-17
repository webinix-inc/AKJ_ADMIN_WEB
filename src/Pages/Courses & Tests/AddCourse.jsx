import { MinusCircleOutlined, PlusOutlined, CloudUploadOutlined, FileTextOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Upload
} from "antd";
import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  createCategory,
  createCourse,
  createSubCategory,
  fetchAllCategories,
  fetchCourses,
  fetchSubCategories,
} from "../../redux/slices/courseSlice";


const { Option } = Select;

const AddCourse = ({ modalShow, onHide }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [courseImage, setCourseImage] = useState([]);
  const [courseNotes, setCourseNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [subcategoryModalShow, setSubcategoryModalShow] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);

  const categories = useSelector((state) => state.courses.categories);

  useEffect(() => {
    if (modalShow) {
      dispatch(fetchAllCategories());
    }
  }, [modalShow, dispatch]);

  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleFaqChange = (index, key, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][key] = value;
    setFaqs(updatedFaqs);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory(null);
    form.setFieldsValue({ category: categoryId, subCategory: undefined });
    dispatch(fetchSubCategories(categoryId))
      .unwrap()
      .then((data) => setSubCategories(data))
      .catch((error) => toast.error(`Error fetching subcategories: ${error}`));
  };

  const handleImageChange = ({ fileList }) => setCourseImage(fileList);
  const handleNotesChange = ({ fileList }) => setCourseNotes(fileList);

  const handleSubmit = async () => {
    const formData = new FormData();
    setLoading(true);

    form.validateFields()
      .then((values) => {
        Object.entries(values).forEach(([key, value]) => {
          if (["courseImage", "courseNotes"].includes(key)) return;
          if (value === undefined || value === null || value === "") return;
          if (key === "startDate" && value?.toISOString) {
            formData.append(key, value.toISOString());
            return;
          }
          formData.append(key, value);
        });

        const validFaqs = faqs.filter(faq => faq.question?.trim() && faq.answer?.trim());
        formData.append("faqs", JSON.stringify(validFaqs.length > 0 ? validFaqs : []));

        if (courseImage.length > 0 && courseImage[0].originFileObj) {
          formData.append("courseImage", courseImage[0].originFileObj);
        }
        courseNotes.forEach((file) => {
          if (file.originFileObj) formData.append("courseNotes", file.originFileObj);
        });

        dispatch(createCourse(formData))
          .unwrap()
          .then(() => {
            toast.success("Course added successfully");
            form.resetFields();
            setCourseImage([]);
            setCourseNotes([]);
            setFaqs([{ question: "", answer: "" }]);
            setSelectedCategory(null);
            setSelectedSubCategory(null);
            setSubCategories([]);
            dispatch(fetchCourses());
            onHide();
          })
          .catch((error) => toast.error(error || "An unexpected error occurred"))
          .finally(() => setLoading(false));
      })
      .catch(() => {
        toast.error("Please fill out the required fields.");
        setLoading(false);
      });
  };

  const handleCategorySubmit = () => {
    if (!newCategoryName) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setCategoryLoading(true);
    dispatch(createCategory({ name: newCategoryName }))
      .unwrap()
      .then(() => {
        toast.success("Category added successfully");
        dispatch(fetchAllCategories());
        setCategoryModalShow(false);
        setNewCategoryName("");
      })
      .catch((error) => toast.error(`Failed to add category: ${error}`))
      .finally(() => setCategoryLoading(false));
  };

  const handleSubCategorySubmit = () => {
    if (!newSubCategoryName) {
      toast.error("Subcategory name cannot be empty.");
      return;
    }
    setSubcategoryLoading(true);
    dispatch(createSubCategory({ categoryId: selectedCategory, subCategoryData: { name: newSubCategoryName } }))
      .unwrap()
      .then(() => {
        toast.success("Subcategory added successfully");
        dispatch(fetchSubCategories(selectedCategory))
          .unwrap()
          .then((data) => setSubCategories(data));
        setSubcategoryModalShow(false);
        setNewSubCategoryName("");
      })
      .catch((error) => toast.error(`Failed to add subcategory: ${error}`))
      .finally(() => setSubcategoryLoading(false));
  };

  // Brighter, more visible styles
  const sectionStyle = {
    marginBottom: '24px',
    padding: '24px',
    background: 'linear-gradient(145deg, #1e1e1e 0%, #171717 100%)',
    borderRadius: '16px',
    border: '1px solid #333',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #333',
  };

  const iconBoxStyle = {
    width: '42px',
    height: '42px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  };

  const labelStyle = {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    display: 'block',
  };

  const inputStyle = {
    background: '#2a2a2a',
    border: '2px solid #404040',
    borderRadius: '10px',
    color: '#ffffff',
    fontSize: '15px',
  };

  const faqInputStyle = {
    ...inputStyle,
    flex: 1,
  };

  return (
    <>
      <Modal
        width={780}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '8px 0' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
            }}>
              <PlusOutlined style={{ color: '#fff', fontSize: '22px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#ffffff' }}>Create New Course</h3>
              <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>Fill in the course details below</p>
            </div>
          </div>
        }
        open={modalShow}
        onCancel={onHide}
        footer={null}
        centered
        styles={{
          content: { background: '#121212', borderRadius: '20px', border: '1px solid #333' },
          header: { background: '#121212', borderBottom: '1px solid #333', padding: '24px 28px' },
          body: { padding: '28px', maxHeight: '70vh', overflowY: 'auto' },
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>

          {/* Basic Info Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconBoxStyle, background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)' }}>📚</div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Basic Information</h4>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Course Title <span style={{ color: '#ef4444' }}>*</span></label>
              <Form.Item
                name="title"
                rules={[{ required: true, message: "Please enter a course title" }]}
                style={{ marginBottom: 0 }}
              >
                <Input
                  placeholder="Enter your course title"
                  size="large"
                  style={inputStyle}
                />
              </Form.Item>
            </div>

            <div>
              <label style={labelStyle}>Description <span style={{ color: '#ef4444' }}>*</span></label>
              <Form.Item
                name="description"
                rules={[{ required: true, message: "Please enter a description" }]}
                style={{ marginBottom: 0 }}
              >
                <ReactQuill
                  theme="snow"
                  value={form.getFieldValue("description")}
                  onChange={(value) => form.setFieldsValue({ description: value })}
                  placeholder="Write a detailed course description..."
                  style={{
                    background: '#2a2a2a',
                    borderRadius: '10px',
                    border: '2px solid #404040',
                  }}
                />
              </Form.Item>
            </div>
          </div>

          {/* FAQs Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconBoxStyle, background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)' }}>❓</div>
              <div>
                <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>FAQs</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Add frequently asked questions (optional)</p>
              </div>
            </div>

            {faqs.map((faq, index) => (
              <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '14px', alignItems: 'flex-start' }}>
                <Input
                  placeholder="Question"
                  value={faq.question}
                  onChange={(e) => handleFaqChange(index, "question", e.target.value)}
                  style={faqInputStyle}
                  size="large"
                />
                <Input
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(e) => handleFaqChange(index, "answer", e.target.value)}
                  style={faqInputStyle}
                  size="large"
                />
                {faqs.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeFaq(index)}
                    style={{ marginTop: '4px' }}
                  />
                )}
              </div>
            ))}
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addFaq}
              style={{ borderColor: '#555', color: '#fff', background: '#2a2a2a' }}
            >
              Add FAQ
            </Button>
          </div>

          {/* Category Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconBoxStyle, background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' }}>📁</div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Category & Classification</h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedCategory ? '1fr 1fr' : '1fr', gap: '20px', marginBottom: '16px' }}>
              <div>
                <label style={labelStyle}>Category <span style={{ color: '#ef4444' }}>*</span></label>
                <Form.Item
                  name="category"
                  rules={[{ required: true, message: "Please select a category" }]}
                  style={{ marginBottom: 0 }}
                >
                  <Select
                    placeholder="Select a category"
                    onChange={handleCategoryChange}
                    size="large"
                    style={{ width: '100%' }}
                    dropdownStyle={{ background: '#1e1e1e', border: '1px solid #404040' }}
                  >
                    {categories?.map((category) => (
                      <Option key={category._id} value={category._id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>

              {selectedCategory && (
                <div>
                  <label style={labelStyle}>Subcategory <span style={{ color: '#ef4444' }}>*</span></label>
                  <Form.Item
                    name="subCategory"
                    rules={[{ required: true, message: "Please select a subcategory" }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Select
                      placeholder="Select a subcategory"
                      onChange={(value) => {
                        setSelectedSubCategory(value);
                        form.setFieldsValue({ subCategory: value });
                      }}
                      size="large"
                      style={{ width: '100%' }}
                    >
                      {subCategories.map((sub) => (
                        <Option key={sub._id} value={sub._id}>{sub.name}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setCategoryModalShow(true)}
                style={{ borderColor: '#555', color: '#fff', background: '#2a2a2a' }}
              >
                Add Category
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={() => setSubcategoryModalShow(true)}
                disabled={!selectedCategory}
                style={{ borderColor: '#555', color: selectedCategory ? '#fff' : '#666', background: '#2a2a2a' }}
              >
                Add Subcategory
              </Button>
            </div>
          </div>

          {/* Schedule Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconBoxStyle, background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' }}>📅</div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Schedule</h4>
            </div>

            <div>
              <label style={labelStyle}>Start Date</label>
              <Form.Item name="startDate" style={{ marginBottom: 0 }}>
                <DatePicker
                  style={{ ...inputStyle, width: '100%' }}
                  size="large"
                  placeholder="Select start date"
                />
              </Form.Item>
            </div>
          </div>

          {/* Media Section */}
          <div style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <div style={{ ...iconBoxStyle, background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }}>🖼️</div>
              <h4 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>Media & Files</h4>
            </div>

            {/* Course Image */}
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Course Thumbnail</label>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                Recommended size: 380 × 285 pixels. Use high-quality images.
              </p>

              <Upload
                listType="picture-card"
                multiple={false}
                accept="image/*"
                fileList={courseImage}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    toast.error('Only image files are allowed!');
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                onChange={handleImageChange}
              >
                {courseImage.length >= 1 ? null : (
                  <div style={{ color: '#aaa', padding: '8px' }}>
                    <CloudUploadOutlined style={{ fontSize: '28px', marginBottom: '8px' }} />
                    <div style={{ fontSize: '13px' }}>Click to Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            {/* Course Notes */}
            <div>
              <label style={labelStyle}>Course Notes</label>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>
                Upload PDF or Word documents for course materials.
              </p>

              <Upload
                multiple
                accept=".pdf,.doc,.docx"
                fileList={courseNotes}
                beforeUpload={(file) => {
                  const allowedTypes = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                  ];
                  if (!allowedTypes.includes(file.type)) {
                    toast.error("Only PDF or Word format allowed!");
                    return Upload.LIST_IGNORE;
                  }
                  return false;
                }}
                onChange={handleNotesChange}
              >
                <Button
                  icon={<FileTextOutlined />}
                  size="large"
                  style={{ borderColor: '#555', color: '#fff', background: '#2a2a2a' }}
                >
                  Upload Documents
                </Button>
              </Upload>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="primary"
            onClick={handleSubmit}
            loading={loading}
            size="large"
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              border: 'none',
              boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)',
            }}
          >
            {loading ? "Creating Course..." : "🚀 Create Course"}
          </Button>
        </Form>
      </Modal>

      {/* Category Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Add New Category</span>}
        open={categoryModalShow}
        onCancel={() => { setCategoryModalShow(false); setNewCategoryName(""); }}
        centered
        styles={{
          content: { background: '#1a1a1a', border: '1px solid #333' },
          header: { background: '#1a1a1a', borderBottom: '1px solid #333' },
          body: { padding: '24px' },
        }}
        footer={[
          <Button key="cancel" onClick={() => setCategoryModalShow(false)} style={{ borderColor: '#555' }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCategorySubmit} loading={categoryLoading}>
            Add Category
          </Button>,
        ]}
      >
        <div>
          <label style={labelStyle}>Category Name</label>
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
            size="large"
            style={inputStyle}
          />
        </div>
      </Modal>

      {/* Subcategory Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>Add New Subcategory</span>}
        open={subcategoryModalShow}
        onCancel={() => { setSubcategoryModalShow(false); setNewSubCategoryName(""); }}
        centered
        styles={{
          content: { background: '#1a1a1a', border: '1px solid #333' },
          header: { background: '#1a1a1a', borderBottom: '1px solid #333' },
          body: { padding: '24px' },
        }}
        footer={[
          <Button key="cancel" onClick={() => setSubcategoryModalShow(false)} style={{ borderColor: '#555' }}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubCategorySubmit} loading={subcategoryLoading}>
            Add Subcategory
          </Button>,
        ]}
      >
        <div>
          <label style={labelStyle}>Subcategory Name</label>
          <Input
            value={newSubCategoryName}
            onChange={(e) => setNewSubCategoryName(e.target.value)}
            placeholder="Enter subcategory name"
            size="large"
            style={inputStyle}
          />
        </div>
      </Modal>
    </>
  );
};

export default AddCourse;
