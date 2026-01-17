import { MinusCircleOutlined, PlusOutlined, CloudUploadOutlined, FileTextOutlined, InfoCircleOutlined, QuestionCircleOutlined, FolderOutlined, CalendarOutlined, PictureOutlined } from "@ant-design/icons";
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

  // Simple, clean style system
  const sectionStyle = {
    marginBottom: '20px',
  };

  const labelStyle = {
    color: '#a1a1aa',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '6px',
    display: 'block',
  };

  const inputStyle = {
    background: '#1a1a1a',
    border: '1px solid #2d2d2d',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
  };

  const faqInputStyle = {
    ...inputStyle,
    flex: 1,
  };

  return (
    <>
      <Modal
        width={520}
        title={
          <span style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff' }}>New Course</span>
        }
        open={modalShow}
        onCancel={onHide}
        footer={null}
        centered
        className="custom-scrollbar"
        styles={{
          content: { background: '#141414', borderRadius: '12px', border: '1px solid #262626' },
          header: { background: '#141414', borderBottom: '1px solid #262626', padding: '16px 20px' },
          body: { padding: '20px', maxHeight: '70vh', overflowY: 'auto' },
        }}
      >
        <Form form={form} layout="vertical" requiredMark={false}>

          {/* Course Title */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Course Title <span style={{ color: '#ef4444' }}>*</span></label>
            <Form.Item
              name="title"
              rules={[{ required: true, message: "Please enter a course title" }]}
              style={{ marginBottom: 0 }}
            >
              <Input
                placeholder="Enter course title"
                style={inputStyle}
              />
            </Form.Item>
          </div>

          {/* Description */}
          <div style={sectionStyle}>
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
                placeholder="Course description..."
                style={{
                  background: '#1a1a1a',
                  borderRadius: '6px',
                  border: '1px solid #2d2d2d',
                }}
              />
            </Form.Item>
          </div>

          {/* FAQs */}
          <div style={sectionStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={labelStyle}>FAQs</label>
              <span style={{ fontSize: '11px', color: '#666' }}>Optional</span>
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

          {/* Category */}
          <div style={sectionStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: selectedCategory ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '12px' }}>

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

            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setCategoryModalShow(true)}
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', background: 'transparent', fontSize: '12px' }}
              >
                Add Category
              </Button>
              <Button
                size="small"
                icon={<PlusOutlined />}
                onClick={() => setSubcategoryModalShow(true)}
                disabled={!selectedCategory}
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: selectedCategory ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', background: 'transparent', fontSize: '12px' }}
              >
                Add Subcategory
              </Button>
            </div>
          </div>

          {/* Schedule */}
          <div style={sectionStyle}>
            <label style={labelStyle}>Start Date <span style={{ fontSize: '11px', color: '#666', fontWeight: 'normal' }}>(Optional)</span></label>
            <Form.Item name="startDate" style={{ marginBottom: 0 }}>
              <DatePicker
                style={{ ...inputStyle, width: '100%' }}
                placeholder="Select date"
              />
            </Form.Item>
          </div>

          {/* Media */}
          <div style={sectionStyle}>

            {/* Course Image */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Course Thumbnail</label>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px' }}>
                380 × 285 pixels recommended
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
                  <div style={{ color: 'rgba(255,255,255,0.5)', padding: '6px' }}>
                    <CloudUploadOutlined style={{ fontSize: '24px', marginBottom: '4px' }} />
                    <div style={{ fontSize: '12px' }}>Upload</div>
                  </div>
                )}
              </Upload>
            </div>

            {/* Course Notes */}
            <div>
              <label style={labelStyle}>Course Notes</label>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', marginBottom: '10px' }}>
                PDF or Word documents
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
                  size="small"
                  style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', background: 'transparent', fontSize: '12px' }}
                >
                  Upload Files
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
              height: '48px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '600',
              background: '#3b82f6',
              border: 'none',
            }}
          >
            {loading ? "Creating..." : "Create Course"}
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
