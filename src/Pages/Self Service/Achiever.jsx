import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import {
  Modal,
  Button,
  Table,
  Upload,
  InputNumber,
  Form,
  notification,
  Tooltip,
  Space
} from "antd";
import api from "../../api/axios";
import './SelfService.css';

const { confirm } = Modal;

const Achiever = () => {
  const [achievers, setAchievers] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fullImageModal, setFullImageModal] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentId, setCurrentId] = useState(null);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchAchievers();
  }, []);

  const fetchAchievers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/achievers");
      setAchievers(response.data);
    } catch (error) {
      console.error("Error fetching achievers:", error);
      notification.error({ message: "Failed to load achievers" });
    } finally {
      setLoading(false);
    }
  };

  const openAchieverModal = (achiever = null) => {
    form.resetFields();
    setImagePreview([]);
    setIsEditing(!!achiever);
    setCurrentId(achiever ? achiever.id : null);

    if (achiever) {
      form.setFieldsValue({ year: achiever.year });
      if (achiever.photos && achiever.photos.length > 0) {
        const fileList = achiever.photos.map((photo, index) => ({
          uid: index,
          name: `Image-${index}.jpg`,
          status: 'done',
          url: photo
        }));
        setImagePreview(fileList);
      }
    }
    setShowModal(true);
  };

  const handleAddOrEditAchiever = async (values) => {
    const formData = new FormData();

    // Append existing photos (URLs) and new photos (Files)
    imagePreview.forEach(file => {
      if (file.originFileObj) {
        formData.append('photo', file.originFileObj);
      } else if (file.url) {
        // If the backend expects existing URLs to be sent back, you might need a different logic.
        // Usually, file uploads replace the old ones or add to them. 
        // Assuming here we primarily handle NEW uploads or keep old logic. 
        // If the API expects existing URLs in a separate field, adjust here.
        // Current logic in original code suggests it only appends 'photo' from originFileObj.
        // We might need to handle deletions of existing images if the API supports it.
      }
    });

    formData.append('year', values.year);

    const endpoint = isEditing ? `/achievers/${currentId}` : '/achievers';
    const method = isEditing ? 'put' : 'post';

    try {
      // Note: The original code's PUT logic might need review if it replaces all photos.
      // Standard multipart/form-data usually handles file adds. 
      await api[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      notification.success({ message: `Achiever ${isEditing ? 'updated' : 'added'} successfully` });
      setShowModal(false);
      fetchAchievers(); // Refresh list
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} achiever:`, error);
      notification.error({ message: "Operation failed" });
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure delete this achiever?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      className: 'dark-modal',
      onOk() {
        handleDeleteAchiever(id);
      },
    });
  };

  const handleDeleteAchiever = async (id) => {
    try {
      await api.delete(`/achievers/${id}`);
      setAchievers(achievers.filter((achiever) => achiever.id !== id));
      notification.success({ message: "Achiever deleted successfully" });
    } catch (error) {
      console.error("Error deleting achiever:", error);
      notification.error({ message: "Failed to delete achiever" });
    }
  };

  const handleImageChange = ({ fileList }) => {
    setImagePreview(fileList);
  };

  const openFullImageModal = (imageSrc) => {
    setFullImageSrc(imageSrc);
    setFullImageModal(true);
  };

  const columns = [
    {
      title: 'Photos',
      dataIndex: 'photos',
      key: 'photos',
      render: (_, record) => (
        <div className="flex gap-2">
          {record.photos.map((photo, index) => (
            <img key={index}
              src={photo}
              alt="Achiever"
              className="w-10 h-10 object-cover rounded-full border border-gray-600 cursor-pointer hover:scale-110 transition-transform"
              onClick={() => openFullImageModal(photo)}
            />
          ))}
        </div>
      )
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      render: (text) => <span className="font-semibold text-white">{text}</span>,
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button type="primary" shape="circle" icon={<EditOutlined />} onClick={() => openAchieverModal(record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button type="primary" danger shape="circle" icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)} />
          </Tooltip>
        </Space>
      )
    },
  ];

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🏆 Student Achievers</h1>
          <p className="page-subtitle">Showcase your top performing students.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={() => openAchieverModal()}>
          <PlusOutlined /> Add Achiever
        </button>
      </div>

      <div className="glass-card p-6">
        <Table
          columns={columns}
          dataSource={achievers}
          rowKey="id"
          loading={loading}
          className="dark-table"
          pagination={{ pageSize: 5 }}
        />
      </div>

      <Modal
        title={isEditing ? "Edit Achiever" : "Add Achiever"}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        className="dark-modal"
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddOrEditAchiever}
        >
          <Form.Item label={<span className="dark-label">Upload Photos</span>}>
            <Upload
              listType="picture-card"
              fileList={imagePreview}
              onChange={handleImageChange}
              beforeUpload={() => false}
              onPreview={(file) => openFullImageModal(file.url || file.thumbUrl)}
              className="dark-upload"
            >
              {imagePreview.length < 5 && (
                <div className="text-gray-400">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label={<span className="dark-label">Year</span>}
            name="year"
            rules={[{ required: true, message: 'Please enter year' }]}
          >
            <InputNumber
              className="dark-input w-full"
              min={1900}
              max={new Date().getFullYear() + 1}
              placeholder="Enter Year (e.g., 2024)"
            />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-6">
            <Button className="secondary-btn" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="primary-btn" icon={<PlusOutlined />}>
              {isEditing ? "Save Changes" : "Add Achiever"}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        visible={fullImageModal}
        onCancel={() => setFullImageModal(false)}
        footer={null}
        className="dark-modal"
        centered
        width={800}
      >
        <img src={fullImageSrc} alt="Full-size" style={{ width: "100%", borderRadius: '8px' }} />
      </Modal>
    </div>
  );
};

export default HOC(Achiever);