import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
  Row,
  Col,
} from "antd";
import {
  createBatchCourse,
  fetchAllCategories,
  fetchSubCategories,
} from "../../redux/slices/courseSlice";
import moment from "moment";

const { Option } = Select;
const { TextArea } = Input;

const BatchCourseForm = ({ visible, onCancel, onSuccess }) => {
  const dispatch = useDispatch();
  const { categories, loading } = useSelector((state) => state.courses);
  const [form] = Form.useForm();
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingSubCategories, setLoadingSubCategories] = useState(false);

  useEffect(() => {
    if (visible) {
      // Fetch categories when modal opens
      dispatch(fetchAllCategories());
      form.resetFields();
      setSubCategories([]);
      setSelectedCategory(null);
    }
  }, [visible, dispatch, form]);

  const handleCategoryChange = async (categoryId) => {
    setSelectedCategory(categoryId);
    setLoadingSubCategories(true);
    try {
      const response = await dispatch(fetchSubCategories(categoryId));
      if (response.payload) {
        setSubCategories(response.payload);
      } else {
        setSubCategories([]);
      }
    } catch (error) {
      console.error("Error fetching subcategories:", error);
      setSubCategories([]);
    } finally {
      setLoadingSubCategories(false);
    }
    // Reset subcategory field when category changes
    form.setFieldsValue({ subCategory: undefined });
  };

  const handleSubmit = async (values) => {
    try {
      // Format dates
      const formattedValues = {
        ...values,
        batchStartDate: values.batchStartDate ? values.batchStartDate.toISOString() : null,
        batchEndDate: values.batchEndDate ? values.batchEndDate.toISOString() : null,
      };

      const response = await dispatch(createBatchCourse(formattedValues));
      
      if (response.type === 'batchCourses/createBatchCourse/fulfilled') {
        message.success("Batch course created successfully!");
        form.resetFields();
        setSubCategories([]);
        setSelectedCategory(null);
        onSuccess();
        onCancel();
      } else {
        message.error(response.payload || "Failed to create batch course");
      }
    } catch (error) {
      console.error("Error creating batch course:", error);
      message.error("Failed to create batch course");
    }
  };

  return (
    <Modal
      title="Create Batch Course"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Course Title"
              name="title"
              rules={[{ required: true, message: "Please enter course title" }]}
            >
              <Input placeholder="Enter course title" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <TextArea
                rows={3}
                placeholder="Enter course description"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Category"
              name="category"
              rules={[{ required: true, message: "Please select a category" }]}
            >
              <Select
                placeholder="Select category"
                onChange={handleCategoryChange}
                loading={loading}
              >
                {categories.map((category) => (
                  <Option key={category._id} value={category._id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Sub Category"
              name="subCategory"
            >
              <Select
                placeholder="Select sub category"
                loading={loadingSubCategories}
                disabled={!selectedCategory}
              >
                {subCategories.map((subCategory) => (
                  <Option key={subCategory._id} value={subCategory._id}>
                    {subCategory.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Batch Name"
              name="batchName"
              rules={[{ required: true, message: "Please enter batch name" }]}
            >
              <Input placeholder="e.g., JEE 2025 Morning Batch" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Batch Size"
              name="batchSize"
              initialValue={50}
            >
              <InputNumber
                min={1}
                max={500}
                placeholder="Maximum students"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Start Date"
              name="batchStartDate"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select start date"
                disabledDate={(current) => current && current < moment().startOf('day')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="End Date"
              name="batchEndDate"
            >
              <DatePicker
                style={{ width: "100%" }}
                placeholder="Select end date"
                disabledDate={(current) => {
                  const startDate = form.getFieldValue('batchStartDate');
                  return current && startDate && current < startDate;
                }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label="Duration"
              name="duration"
            >
              <Input placeholder="e.g., 6 months" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Lessons"
              name="lessons"
            >
              <Input placeholder="e.g., 120 lessons" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Weeks"
              name="weeks"
            >
              <Input placeholder="e.g., 24 weeks" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <div style={{ textAlign: "right" }}>
            <Button onClick={onCancel} style={{ marginRight: 8 }}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
            >
              Create Batch Course
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default BatchCourseForm;
