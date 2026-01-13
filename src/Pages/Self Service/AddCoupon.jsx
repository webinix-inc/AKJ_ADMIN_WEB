import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createCoupon } from "../../redux/slices/couponSlice";
import {
  Form,
  Input,
  Select,
  Button,
  DatePicker,
  TimePicker,
  Checkbox,
  Row,
  Col,
  notification,
  Card
} from "antd";
import {
  ArrowLeftOutlined,
  SaveOutlined,
  TagOutlined,
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DollarOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import dayjs from "dayjs";
import { fetchCourses } from "../../redux/slices/courseSlice";
import './SelfService.css';

const { Option } = Select;

const AddCoupon = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  const { courses, loading: coursesLoading } = useSelector(
    (state) => state.courses
  );

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Format dates and times
      const formattedValues = {
        ...values,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : undefined,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : undefined,
        startTime: values.startTime ? values.startTime.format('HH:mm') : undefined,
        endTime: values.endTime ? values.endTime.format('HH:mm') : undefined,
      };

      // Handle array conversion for Assigned User IDs
      if (typeof formattedValues.assignedUserIds === 'string') {
        formattedValues.assignedUserIds = formattedValues.assignedUserIds.split(',').map(id => id.trim());
      }

      await dispatch(createCoupon(formattedValues)).unwrap();
      notification.success({ message: "Coupon created successfully!" });
      setTimeout(() => {
        navigate("/selfservice/manage-coupons");
      }, 1500);
    } catch (error) {
      console.error("Error creating coupon:", error);
      notification.error({ message: "Failed to create coupon" });
    } finally {
      setLoading(false);
    }
  };

  // Watch for form value changes to conditionally render fields
  const couponType = Form.useWatch('couponType', form);
  const courseSelectionType = Form.useWatch('courseSelectionType', form);
  const discountType = Form.useWatch('discountType', form);
  const isLifetime = Form.useWatch('isLifetime', form);

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-white hover:text-blue-400 p-0 mr-2"
            onClick={() => navigate("/selfservice/manage-coupons")}
          >
            Back
          </Button>
          <span className="page-title align-middle">🎟️ Create Coupon Code</span>
          <p className="page-subtitle ml-8">Design a new discount offer for your students.</p>
        </div>
      </div>

      <div className="glass-card max-w-5xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            couponType: "Public",
            courseSelectionType: "All",
            discountType: "Flat",
            isUnlimited: false,
            visibility: true,
            isLifetime: true,
            usageCount: 0,
            userUsage: [],
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left Column: Core Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">
                <TagOutlined /> Basic Information
              </h3>

              <Form.Item
                label={<span className="dark-label">Offer Name</span>}
                name="offerName"
                rules={[{ required: true, message: 'Please enter offer name' }]}
              >
                <Input placeholder="e.g. New Year Sale" className="dark-input" prefix={<TagOutlined className="text-gray-500" />} />
              </Form.Item>

              <Form.Item
                label={<span className="dark-label">Coupon Code</span>}
                name="couponCode"
                rules={[{ required: true, message: 'Please enter coupon code' }]}
              >
                <Input placeholder="e.g. WELCOME2025" className="dark-input font-mono uppercase" />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={<span className="dark-label">Coupon Type</span>} name="couponType">
                    <Select className="dark-select" dropdownClassName="dark-dropdown">
                      <Option value="Public">Public</Option>
                      <Option value="Private">Private</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={<span className="dark-label">Visibility</span>} name="visibility" valuePropName="checked">
                    <Checkbox className="text-gray-300">Visible to Users</Checkbox>
                  </Form.Item>
                </Col>
              </Row>

              {couponType === 'Private' && (
                <Form.Item
                  label={<span className="dark-label">Assigned User IDs</span>}
                  name="assignedUserIds"
                  help="Comma separated user IDs"
                >
                  <Input.TextArea placeholder="User ID 1, User ID 2..." className="dark-input" rows={2} />
                </Form.Item>
              )}

              <h3 className="text-lg font-semibold text-blue-400 mt-8 mb-4 border-b border-gray-700 pb-2">
                <BookOutlined /> Course Applicability
              </h3>

              <Form.Item label={<span className="dark-label">Course Selection</span>} name="courseSelectionType">
                <Select className="dark-select" dropdownClassName="dark-dropdown">
                  <Option value="All">All Courses</Option>
                  <Option value="Specific">Specific Courses</Option>
                </Select>
              </Form.Item>

              {courseSelectionType === 'Specific' && (
                <Form.Item
                  label={<span className="dark-label">Select Courses</span>}
                  name="assignedCourseIds"
                  rules={[{ required: true, message: 'Please select at least one course' }]}
                >
                  <Select
                    mode="multiple"
                    placeholder="Search and select courses"
                    className="dark-select"
                    dropdownClassName="dark-dropdown"
                    loading={coursesLoading}
                    optionFilterProp="children"
                  >
                    {courses.map(course => (
                      <Option key={course._id} value={course._id}>{course.title}</Option>
                    ))}
                  </Select>
                </Form.Item>
              )}
            </div>

            {/* Right Column: Limits & values */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-400 mb-4 border-b border-gray-700 pb-2">
                <DollarOutlined /> Discount & Usage
              </h3>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={<span className="dark-label">Discount Type</span>} name="discountType">
                    <Select className="dark-select" dropdownClassName="dark-dropdown">
                      <Option value="Flat">Flat Amount (₹)</Option>
                      <Option value="Percentage">Percentage (%)</Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="dark-label">{discountType === 'Flat' ? 'Amount (₹)' : 'Percentage (%)'}</span>}
                    name={discountType === 'Flat' ? 'discountAmount' : 'discountPercentage'}
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <Input type="number" className="dark-input" min={0} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={<span className="dark-label">Minimum Order Value (₹)</span>} name="minimumOrderValue">
                <Input type="number" className="dark-input" min={0} />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label={<span className="dark-label">Total Usage Limit</span>} name="usageLimit">
                    <Input type="number" className="dark-input" placeholder="Total redemptions" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label={<span className="dark-label">Usage Per Student</span>} name="usagePerStudent">
                    <Input type="number" className="dark-input" placeholder="Max per user" />
                  </Form.Item>
                </Col>
              </Row>

              <h3 className="text-lg font-semibold text-blue-400 mt-8 mb-4 border-b border-gray-700 pb-2">
                <ClockCircleOutlined /> Validity Period
              </h3>

              <Form.Item name="isLifetime" valuePropName="checked">
                <Checkbox className="text-gray-300">Lifetime Validity</Checkbox>
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label={<span className="dark-label">Start Date</span>}
                    name="startDate"
                    rules={[{ required: true, message: 'Required' }]}
                  >
                    <DatePicker className="w-full dark-input" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={<span className="dark-label">Start Time</span>}
                    name="startTime"
                  >
                    <TimePicker className="w-full dark-input" format="HH:mm" />
                  </Form.Item>
                </Col>
              </Row>

              {!isLifetime && (
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="dark-label">End Date</span>}
                      name="endDate"
                      rules={[{ required: true, message: 'Required' }]}
                    >
                      <DatePicker className="w-full dark-input" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      label={<span className="dark-label">End Time</span>}
                      name="endTime"
                    >
                      <TimePicker className="w-full dark-input" format="HH:mm" />
                    </Form.Item>
                  </Col>
                </Row>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end gap-4">
            <Button className="secondary-btn" size="large" onClick={() => navigate("/selfservice/manage-coupons")}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="primary-btn"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Create Coupon
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default HOC(AddCoupon);
