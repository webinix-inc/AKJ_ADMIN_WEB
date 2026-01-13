import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import { getBannerImageUrl } from "../../utils/imageUtils";
import {
  Form,
  Input,
  Select,
  Button,
  Upload,
  Row,
  Col,
  Modal,
  notification,
  Tag,
  Tooltip
} from "antd";
import {
  UploadOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  LinkOutlined,
  ClockCircleOutlined,
  BookOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import './SelfService.css';

const { Option } = Select;
const { confirm } = Modal;

const ManageBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchBanners();
  }, [dispatch]);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.get("/admin/banner");
      const bannersData = response.data.data || [];
      setBanners(bannersData);
    } catch (error) {
      console.error("❌ Error fetching banners:", error);
      notification.error({ message: "Failed to fetch banners" });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values) => {
    setLoading(true);
    const formData = new FormData();

    formData.append('name', values.name.trim());
    formData.append('course', values.course || '');
    formData.append('timePeriod', values.timePeriod || '');
    formData.append('externalLink', values.externalLink || '');

    if (values.image?.fileList?.[0]?.originFileObj) {
      formData.append('image', values.image.fileList[0].originFileObj);
    } else if (!isEditing && !values.image) {
      notification.error({ message: "Image is required for new banners" });
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        await api.put(`/admin/banner/${editingBannerId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        notification.success({ message: "Banner updated successfully!" });
      } else {
        const response = await api.post("/admin/banner", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.status === 201 || response.data.status === 201) {
          notification.success({ message: "Banner created successfully!" });
        }
      }
      form.resetFields();
      setIsEditing(false);
      setEditingBannerId(null);
      fetchBanners();
    } catch (error) {
      console.error("❌ Error submitting form:", error);
      notification.error({ message: "Failed to save banner" });
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id, bannerName) => {
    confirm({
      title: 'Are you sure delete this banner?',
      icon: <ExclamationCircleOutlined />,
      content: `Banner "${bannerName}" will be permanently deleted.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      className: 'dark-modal',
      onOk: async () => {
        try {
          setLoading(true);
          await api.delete(`/admin/banner/${id}`);
          notification.success({ message: "Banner deleted successfully!" });
          fetchBanners();
        } catch (error) {
          notification.error({ message: "Failed to delete banner" });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleEdit = (banner) => {
    setIsEditing(true);
    setEditingBannerId(banner._id);
    form.setFieldsValue({
      name: banner.name,
      course: banner.course?._id || banner.course,
      timePeriod: banner.timePeriod,
      externalLink: banner.externalLink,
      image: null // Reset upload field
    });
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to form
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingBannerId(null);
    form.resetFields();
  };

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🖼️ Manage Banners</h1>
          <p className="page-subtitle">Create and manage your homepage promotional banners.</p>
        </div>
      </div>

      <div className="glass-card mb-8">
        <div className="flex justify-between items-center border-b border-gray-700 pb-4 mb-6">
          <h2 className="text-xl font-bold text-white">
            {isEditing ? "✏️ Edit Banner" : "➕ Add New Banner"}
          </h2>
          <div className="bg-blue-500/10 px-3 py-1 rounded text-blue-400 text-xs">
            Recommended Size: 1220 × 205 px
          </div>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          className="text-left"
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="dark-label">Banner Name</span>}
                name="name"
                rules={[{ required: true, message: 'Please enter banner name' }]}
              >
                <Input placeholder="e.g. JEE 2025 Admission Open" className="dark-input" />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="dark-label">Associated Course</span>}
                name="course"
              >
                <Select placeholder="Select a course (Optional)" className="dark-select" dropdownClassName="dark-dropdown">
                  {courses.map((course) => (
                    <Option key={course._id} value={course._id}>{course.title}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="dark-label">Time Period</span>}
                name="timePeriod"
              >
                <Input placeholder="e.g. Jan 2025 - Mar 2025" className="dark-input" prefix={<ClockCircleOutlined className="text-gray-500" />} />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label={<span className="dark-label">External Link</span>}
                name="externalLink"
              >
                <Input placeholder="https://example.com" className="dark-input" prefix={<LinkOutlined className="text-gray-500" />} />
              </Form.Item>
            </Col>

            <Col xs={24}>
              <Form.Item
                label={<span className="dark-label">Banner Image {!isEditing && <span className="text-red-500">*</span>}</span>}
                name="image"
                rules={[{ required: !isEditing, message: 'Please upload an image' }]}
              >
                <Upload
                  beforeUpload={() => false}
                  maxCount={1}
                  listType="picture"
                  className="dark-upload"
                >
                  <Button icon={<UploadOutlined />} className="secondary-btn">Select Image</Button>
                </Upload>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-3 mt-4">
            <button type="submit" className="primary-btn flex items-center gap-2">
              {isEditing ? <EditOutlined /> : <PlusOutlined />}
              {isEditing ? "Update Banner" : "Create Banner"}
            </button>
            {isEditing && (
              <button type="button" onClick={handleCancel} className="secondary-btn">
                Cancel
              </button>
            )}
          </div>
        </Form>
      </div>

      <h2 className="text-xl font-bold text-white mb-4 pl-2 border-l-4 border-blue-500">Current Banners ({banners.length})</h2>

      <Row gutter={[24, 24]}>
        {banners.map((banner) => (
          <Col key={banner._id} xs={24} sm={12} lg={8}>
            <div className="glass-card p-0 flex flex-col h-full group">
              <div className="relative h-48 overflow-hidden border-b border-gray-700">
                <img
                  src={getBannerImageUrl(banner._id)}
                  alt={banner.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x200?text=No+Image';
                  }}
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Tooltip title="Edit">
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<EditOutlined />}
                      size="small"
                      onClick={() => handleEdit(banner)}
                    />
                  </Tooltip>
                  <Tooltip title="Delete">
                    <Button
                      type="primary"
                      danger
                      shape="circle"
                      icon={<DeleteOutlined />}
                      size="small"
                      onClick={() => showDeleteConfirm(banner._id, banner.name)}
                    />
                  </Tooltip>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{banner.name}</h3>

                <div className="space-y-2 mb-4 flex-1">
                  {banner.course && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <BookOutlined className="text-blue-400" />
                      <span className="line-clamp-1">{banner.course.title || "Course Info"}</span>
                    </div>
                  )}
                  {banner.timePeriod && (
                    <Tag icon={<ClockCircleOutlined />} color="#1a85ff20" className="text-blue-300 border-blue-500/30 m-0">
                      {banner.timePeriod}
                    </Tag>
                  )}
                </div>

                {banner.externalLink && (
                  <a
                    href={banner.externalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 text-sm hover:text-blue-300 flex items-center gap-1 mt-auto"
                  >
                    <LinkOutlined /> Visit Link
                  </a>
                )}
              </div>
            </div>
          </Col>
        ))}
        {banners.length === 0 && !loading && (
          <Col span={24}>
            <div className="text-center py-12 text-gray-500 bg-white/5 rounded-xl border border-white/10 border-dashed">
              No banners found. Start by creating one!
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default HOC(ManageBanners);
