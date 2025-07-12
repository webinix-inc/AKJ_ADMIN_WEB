import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createCourse,
  fetchAllCategories,
  createCategory,
  fetchSubCategories,
  createSubCategory,
} from "../../redux/slices/courseSlice";
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Button,
  Select,
  Radio,
  Space,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const { Option } = Select;

const AddCourse = ({ modalShow, onHide }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [courseImage, setCourseImage] = useState([]);
  const [courseNotes, setCourseNotes] = useState([]);
  const [courseVideos, setCourseVideos] = useState([]);
  const [videoTypes, setVideoTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [faqs, setFaqs] = useState([{ question: "", answer: "" }]); // FAQ state
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]); // Store subcategories for the selected category
  const [categoryModalShow, setCategoryModalShow] = useState(false);
  const [subcategoryModalShow, setSubcategoryModalShow] = useState(false); // Modal for adding new subcategory
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newSubCategoryName, setNewSubCategoryName] = useState(""); // New subcategory input state
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [subcategoryLoading, setSubcategoryLoading] = useState(false); // Loading state for subcategory creation

  const categories = useSelector((state) => state.courses.categories);

  // Fetch categories and subcategories when the modal is opened
  useEffect(() => {
    if (modalShow) {
      dispatch(fetchAllCategories());
    }
  }, [modalShow, dispatch]);

  // Handle FAQ addition/removal
  const addFaq = () => setFaqs([...faqs, { question: "", answer: "" }]);
  const removeFaq = (index) => setFaqs(faqs.filter((_, i) => i !== index));

  const handleFaqChange = (index, key, value) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][key] = value;
    setFaqs(updatedFaqs);
  };

  // Fetch subcategories when a category is selected
  const handleCategoryChange = (categoryId) => {
    console.log(categoryId);
    setSelectedCategory(categoryId);
    dispatch(fetchSubCategories(categoryId))
      .unwrap()
      .then((data) => {
        setSubCategories(data); // Set subcategories for selected category
        setSelectedSubCategory(null); // Reset selected subcategory when category changes
      })
      .catch((error) => toast.error(`Error fetching subcategories: ${error}`));
  };

  const handleImageChange = ({ fileList }) => {
    setCourseImage(fileList);
  };

  const handleNotesChange = ({ fileList }) => {
    setCourseNotes(fileList);
  };

  const handleVideoChange = ({ fileList }) => {
    setCourseVideos(fileList);
  };

  const handleVideoTypeChange = (file, type) => {
    setVideoTypes({
      ...videoTypes,
      [file.uid]: type,
    });
  };

  const handleSubmit = async () => {
    console.log("Selected SubCategory:", selectedSubCategory);
    const formData = new FormData();
    setLoading(true);

    form
      .validateFields()
      .then((values) => {
        // Append the rest of the form values
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });

        // Append FAQs
        formData.append("faqs", JSON.stringify(faqs));

        // Append images, notes, and videos
        courseImage.forEach((file) => {
          if (file.originFileObj) {
            formData.append("courseImage", file.originFileObj);
          }
        });
        courseNotes.forEach((file) => {
          if (file.originFileObj) {
            formData.append("courseNotes", file.originFileObj);
          }
        });
        courseVideos.forEach((file) => {
          if (file.originFileObj) {
            formData.append("courseVideo", file.originFileObj);
            formData.append("videoType", videoTypes[file.uid]);
          }
        });

        // Dispatch the action to create the course
        dispatch(createCourse(formData))
          .unwrap()
          .then(() => {
            toast.success("Course added successfully");
            onHide();
          })
          .catch((error) => {
            toast.error(`Failed to add the course: ${error}`);
          })
          .finally(() => {
            setLoading(false);
          });
      })
      .catch(() => {
        toast.error("Please fill out the required fields.");
        setLoading(false);
      });
  };

  const handleCategoryModalOpen = () => {
    setCategoryModalShow(true);
  };

  const handleCategoryModalClose = () => {
    setCategoryModalShow(false);
    setNewCategoryName("");
  };

  const handleSubcategoryModalOpen = () => {
    setSubcategoryModalShow(true);
  };

  const handleSubcategoryModalClose = () => {
    setSubcategoryModalShow(false);
    setNewSubCategoryName("");
  };

  // Create new category
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
        handleCategoryModalClose();
      })
      .catch((error) => {
        toast.error(`Failed to add category: ${error}`);
      })
      .finally(() => {
        setCategoryLoading(false);
      });
  };

  // Create new subcategory
  const handleSubCategorySubmit = () => {
    if (!newSubCategoryName) {
      toast.error("Subcategory name cannot be empty.");
      return;
    }

    setSubcategoryLoading(true);
    dispatch(
      createSubCategory({
        categoryId: selectedCategory,
        subCategoryData: { name: newSubCategoryName },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Subcategory added successfully");
        dispatch(fetchSubCategories(selectedCategory)).then((data) => {
          setSubCategories(data); // Refresh subcategories
        });
        handleSubcategoryModalClose();
      })
      .catch((error) => {
        toast.error(`Failed to add subcategory: ${error}`);
      })
      .finally(() => {
        setSubcategoryLoading(false);
      });
  };

  return (
    <>
      <Modal
        width={1000}
        title="Add Course"
        visible={modalShow}
        onCancel={onHide}
        footer={null}
        centered>
        <Form
          form={form}
          layout="vertical"
          initialValues={{ approvalStatus: "pending", courseType: "Paid" }}>
          <Form.Item
            name="title"
            label="Course Title"
            rules={[
              { required: true, message: "Please enter a course title" },
            ]}>
            <Input placeholder="Course Title" type="text" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter a description" }]}>
            <ReactQuill
              theme="snow"
              value={form.getFieldValue("description")}
              onChange={(value) => form.setFieldsValue({ description: value })}
              placeholder="Course Description"
            />
          </Form.Item>

          {/* FAQ Section */}
          <div style={{ marginBottom: 20 }}>
            <h4>FAQs</h4>
            {faqs.map((faq, index) => (
              <Space key={index} align="start" style={{ marginBottom: 10 }}>
                <Input
                  placeholder="Question"
                  type="text"
                  value={faq.question}
                  onChange={(e) =>
                    handleFaqChange(index, "question", e.target.value)
                  }
                />
                <Input
                  placeholder="Answer"
                  type="text"
                  value={faq.answer}
                  onChange={(e) =>
                    handleFaqChange(index, "answer", e.target.value)
                  }
                />
                <MinusCircleOutlined
                  onClick={() => removeFaq(index)}
                  style={{ color: "red" }}
                />
              </Space>
            ))}
            <Button type="dashed" icon={<PlusOutlined />} onClick={addFaq}>
              Add FAQ
            </Button>
          </div>

          {/* Category and Subcategory Selection */}
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please select a category" }]}>
            <Select
              placeholder="Select a category"
              onChange={handleCategoryChange}>
              {categories?.map((category) => (
                <Option key={category._id} value={category._id}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          {subCategories.length > 0 && (
            <Form.Item
              name="subCategory"
              label="Subcategory"
              rules={[
                { required: true, message: "Please select a subcategory" },
              ]}>
              <Select
                placeholder="Select a subcategory"
                onChange={(value) => setSelectedSubCategory(value)}>
                {subCategories.map((subCategory) => (
                  <Option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleCategoryModalOpen}
            style={{ marginBottom: "16px" }}>
            Add New Category
          </Button>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleSubcategoryModalOpen}
            disabled={!selectedCategory}
            style={{ marginBottom: "16px", marginLeft: "10px" }}>
            Add New Subcategory
          </Button>

          {/* Category Modal */}
          <Modal
            title="Add New Category"
            visible={categoryModalShow}
            onCancel={handleCategoryModalClose}
            footer={[
              <Button key="cancel" onClick={handleCategoryModalClose}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleCategorySubmit}
                loading={categoryLoading}>
                Add Category
              </Button>,
            ]}>
            <Form layout="vertical">
              <Form.Item label="Category Name">
                <Input
                  value={newCategoryName}
                  type="text"
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Enter category name"
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* Subcategory Modal */}
          <Modal
            title="Add New Subcategory"
            visible={subcategoryModalShow}
            onCancel={handleSubcategoryModalClose}
            footer={[
              <Button key="cancel" onClick={handleSubcategoryModalClose}>
                Cancel
              </Button>,
              <Button
                key="submit"
                type="primary"
                onClick={handleSubCategorySubmit}
                loading={subcategoryLoading}>
                Add Subcategory
              </Button>,
            ]}>
            <Form layout="vertical">
              <Form.Item label="Subcategory Name">
                <Input
                  value={newSubCategoryName}
                  onChange={(e) => setNewSubCategoryName(e.target.value)}
                  placeholder="Enter subcategory name"
                />
              </Form.Item>
            </Form>
          </Modal>

          {/* <Form.Item name="price" label="Price">
            <Input type="number" placeholder="Price" />
          </Form.Item> */}

          <Form.Item name="startDate" label="Start Date">
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item name="courseImage" label="Course Image">
            <p class="text-sm font-semibold text-gray-700">
              Recommended Size: 380 × 285 px
            </p>
            <p class="text-sm text-red-500">
              Warning: Adding an image larger than the recommended size may
              negatively impact the UI and could result in improper display.
            </p>
            <Upload
              listType="picture-card"
              multiple
              beforeUpload={() => false}
              onChange={handleImageChange}>
              {courseImage.length >= 10 ? null : (
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item name="courseNotes" label="Course Notes">
            <p class="text-md font-semibold text-gray-700">
              Course Notes must be in document and Word format
            </p>
            <p class="text-sm text-red-500">
              Warning: Uploading files in unsupported formats may cause errors
              or may not display correctly.
            </p>

            <Upload
              multiple
              beforeUpload={() => false}
              onChange={handleNotesChange}
              accept=".pdf,.doc,.docx">
              {courseNotes.length >= 10 ? null : (
                <Button icon={<PlusOutlined />}>Upload Notes</Button>
              )}
            </Upload>
          </Form.Item>

          {/* <Form.Item name="courseVideo" label="Course Video">
            <Upload
              multiple
              beforeUpload={() => false}
              onChange={handleVideoChange}
              accept="video/*">
              {courseVideos.length >= 10 ? null : (
                <Button icon={<PlusOutlined />}>Upload Videos</Button>
              )}
            </Upload>

            {courseVideos.map((file) => (
              <div key={file.uid} style={{ marginTop: 10 }}>
                <span>{file.name}</span>
                <Radio.Group
                  value={videoTypes[file.uid] || "Free"}
                  onChange={(e) => handleVideoTypeChange(file, e.target.value)}
                  style={{ marginLeft: 10 }}>
                  <Radio value="Free">Free</Radio>
                  <Radio value="Paid">Paid</Radio>
                </Radio.Group>
              </div>
            ))}
          </Form.Item> */}

          <Form.Item>
            <Button type="primary" onClick={handleSubmit} loading={loading}>
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddCourse;
