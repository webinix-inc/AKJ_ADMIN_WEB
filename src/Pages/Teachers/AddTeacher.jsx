import React, { useState } from "react";
import HOC from "../../Component/HOC/HOC";
import { useNavigate } from "react-router-dom";
import "./Teachers.css";
import { useDispatch, useSelector } from "react-redux";
import { registerTeacher } from "../../redux/slices/teacherSlice";
import {
  Form,
  Input,
  Button,
  Upload,
  Switch,
  Row,
  Col,
  Typography,
  notification
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  ArrowLeftOutlined
} from "@ant-design/icons";

const { TextArea } = Input;

const AddTeacher = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.teacher);
  const [form] = Form.useForm();

  // State to manage file uploads locally for FormData construction
  const [fileListPhoto, setFileListPhoto] = useState([]);

  // Default permissions state
  const [permissions, setPermissions] = useState({
    coursesPermission: true,
    bookStorePermission: true,
    planPermission: true,
    reportAndAnalyticPermission: true,
    chatPermission: true,
    marketingServicesPermission: true,
    testPortalPermission: true,
    peoplePermission: true,
  });

  const onPermissionChange = (key, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: checked,
    }));
  };

  const onFinish = async (values) => {
    try {
      const formDataToSend = new FormData();

      // Append standard fields
      Object.keys(values).forEach((key) => {
        if (values[key] !== undefined && values[key] !== null) {
          formDataToSend.append(key, values[key]);
        }
      });

      // Append permissions as JSON string (preserving original logic)
      formDataToSend.append("permissions", JSON.stringify(permissions));

      // Append Files
      if (fileListPhoto.length > 0) {
        formDataToSend.append("photo", fileListPhoto[0].originFileObj);
      }
      // Note: Original code didn't actually expose a Document upload UI in the main form, 
      // but it had logic for it. I will check if 'document' field existed in original UI.
      // Checking original code: it had <input type="file" ... id="photo"> but NOT for document in the JSX visible area?
      // Wait, looking at original code line 166-184... it only had "Teacher's Photo".
      // But state had `document: null`. 
      // The `handleSubmit` logic checked `key === "document"`.
      // I will add a proper Upload for Document just in case, or stick to Photo if that's all that was there.
      // Original JSX only showed Photo upload. I will strictly stick to Photo to "do not remove any fields", 
      // but technically adding a missing field IS "removing" a bug/omission? 
      // I'll stick to Photo to be safe, but support Document logic if I see it in JSX.
      // UPDATE: Original JSX lines 164-184 Only show Photo. So I will only show Photo.

      // Dispatch the action
      await dispatch(
        registerTeacher({ teacherData: formDataToSend })
      );

      notification.success({
        message: 'Success',
        description: 'Teacher registered successfully!',
        placement: 'topRight'
      });
      navigate("/teachers");

    } catch (err) {
      console.error("Error during form submission:", err);
      notification.error({
        message: 'Submission Failed',
        description: error || err.message || "An error occurred",
        placement: 'topRight'
      });
    }
  };

  const uploadPropsPhoto = {
    onRemove: (file) => {
      setFileListPhoto([]);
    },
    beforeUpload: (file) => {
      setFileListPhoto([file]);
      return false; // Prevent auto upload
    },
    fileList: fileListPhoto,
    maxCount: 1,
    listType: "picture-card",
    showUploadList: { showPreviewIcon: false }
  };

  return (
    <div className="teachers-container">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: '20px', color: '#fff' }} />}
            onClick={() => navigate("/teachers")}
          />
          <div>
            <h1 className="page-title">Add New Teacher</h1>
            <p className="page-subtitle">Create a new teacher profile and assign permissions</p>
          </div>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          experience: "", // Ensure controlled input
        }}
      >
        <div className="glass-card" style={{ padding: '32px' }}>
          <Row gutter={32}>
            {/* Left Column: Photo & Permissions */}
            <Col xs={24} lg={8}>
              <div className="mb-6">
                <label className="dark-label mb-2">Teacher's Photo</label>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '8px', textAlign: 'center', border: '1px dashed rgba(255,255,255,0.2)' }}>
                  <Upload {...uploadPropsPhoto}>
                    {fileListPhoto.length < 1 && (
                      <div>
                        <div style={{ marginTop: 8, color: '#aaa' }}>Upload Photo</div>
                      </div>
                    )}
                  </Upload>
                </div>
              </div>

              <div>
                <h3 className="text-white mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Permissions</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {Object.keys(permissions).map((key) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '10px 16px', borderRadius: '8px' }}>
                      <span style={{ color: '#ddd' }}>{key.replace("Permission", "").replace(/([A-Z])/g, ' $1').trim()}</span>
                      <Switch
                        checked={permissions[key]}
                        onChange={(checked) => onPermissionChange(key, checked)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Right Column: Form Details */}
            <Col xs={24} lg={16}>
              <h3 className="text-white mb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>Basic Details</h3>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="firstName" label={<span className="dark-label">First Name</span>} rules={[{ required: true, message: 'Please enter first name' }]}>
                    <Input className="dark-input" placeholder="Enter first name" prefix={<UserOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="lastName" label={<span className="dark-label">Last Name</span>} rules={[{ required: true, message: 'Please enter last name' }]}>
                    <Input className="dark-input" placeholder="Enter last name" prefix={<UserOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="email" label={<span className="dark-label">Email</span>} rules={[{ required: true, type: 'email', message: 'Please enter a valid email' }]}>
                    <Input className="dark-input" placeholder="Enter email" prefix={<MailOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="mobileNumber" label={<span className="dark-label">Phone</span>} rules={[{ required: true, message: 'Please enter phone number' }]}>
                    <Input className="dark-input" placeholder="Enter phone number" prefix={<PhoneOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item name="password" label={<span className="dark-label">Password</span>} rules={[{ required: true, message: 'Please enter password' }]}>
                    <Input.Password className="dark-input" placeholder="Enter password" prefix={<LockOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="confirmPassword"
                    label={<span className="dark-label">Confirm Password</span>}
                    deps={['password']}
                    rules={[
                      { required: true, message: 'Please confirm password' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password className="dark-input" placeholder="Confirm password" prefix={<LockOutlined style={{ color: '#666' }} />} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="experience" label={<span className="dark-label">Years of Experience</span>}>
                <Input type="number" className="dark-input" placeholder="Enter years of experience" />
              </Form.Item>

              <Form.Item name="userBio" label={<span className="dark-label">Bio</span>}>
                <TextArea className="dark-input" rows={4} placeholder="Write a brief bio" style={{ height: 'auto', paddingTop: '10px' }} />
              </Form.Item>

              <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  className="secondary-btn"
                  style={{ marginRight: '16px' }}
                  onClick={() => navigate("/teachers")}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  className="primary-btn"
                  htmlType="submit"
                  loading={loading}
                >
                  Add Teacher
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
};

export default HOC(AddTeacher);
