import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Switch, message, Space, Tooltip } from "antd";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import './SelfService.css';

const { confirm } = Modal;

const ClientTestimonial = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await api.get("admin/testimonial");
      const sortedTestimonials = response.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setTestimonials(sortedTestimonials);
    } catch (error) {
      console.error("Error fetching testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure delete this testimonial?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      className: 'dark-modal',
      onOk() {
        handleDelete(id);
      },
    });
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`admin/testimonial/${id}`);
      setTestimonials(testimonials.filter((t) => t._id !== id));
      message.success("Testimonial deleted successfully");
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      message.error("Failed to delete testimonial");
    }
  };

  const handleAddTestimonial = async (values) => {
    setLoading(true);
    try {
      // Assuming the API expects specific format. 
      // The original code was simple json post.
      const response = await api.post("admin/testimonial", values);
      setTestimonials([response.data, ...testimonials]);
      setAddModalVisible(false);
      form.resetFields();
      message.success("Testimonial added successfully");
    } catch (error) {
      console.error("Error adding testimonial:", error);
      message.error("Failed to add testimonial");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id, updatedFields) => {
    try {
      const response = await api.put(`admin/testimonial/${id}`, updatedFields);
      setTestimonials((prevTestimonials) =>
        prevTestimonials.map((testimonial) =>
          testimonial._id === id
            ? { ...testimonial, ...response.data }
            : testimonial
        )
      );
      message.success("Testimonial updated successfully");
    } catch (error) {
      console.error("Error updating testimonial:", error);
      message.error("Failed to update testimonial");
    }
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url, record) => (
        <div className="flex items-center gap-3">
          <img
            src={url || "https://via.placeholder.com/50"}
            alt="client"
            className="w-10 h-10 rounded-full object-cover border border-gray-600"
          />
          <span className="font-medium text-white">{record.name}</span>
        </div>
      ),
    },
    {
      title: "Testimonial",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
      render: (text) => <span className="text-gray-300">{text}</span>
    },
    {
      title: "Visibility",
      dataIndex: "isVisible",
      key: "isVisible",
      render: (isVisible, record) => (
        <Switch
          checked={isVisible}
          onChange={(checked) => handleEdit(record._id, { isVisible: checked })}
          className="bg-gray-600"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-white hover:text-blue-400 p-0 mr-2"
            onClick={() => navigate("/selfservice")}
          >
            Back
          </Button>
          <span className="page-title align-middle">💬 Client Testimonials</span>
          <p className="page-subtitle ml-8">Manage what your clients say about you.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={() => setAddModalVisible(true)}>
          <PlusOutlined /> Add Testimonial
        </button>
      </div>

      <div className="glass-card p-6">
        <Table
          columns={columns}
          dataSource={testimonials}
          rowKey="_id"
          loading={loading}
          className="dark-table"
          pagination={{ pageSize: 5 }}
        />
      </div>

      <Modal
        title="Add Testimonial"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}
        className="dark-modal"
        destroyOnClose
      >
        <Form layout="vertical" form={form} onFinish={handleAddTestimonial}>
          <Form.Item
            name="name"
            label={<span className="dark-label">Name</span>}
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input placeholder="Enter client name" className="dark-input" />
          </Form.Item>

          <Form.Item
            name="imageUrl"
            label={<span className="dark-label">Image URL</span>}
          // rules={[{ required: true, message: "Please enter image URL" }]} // Optional in original?
          >
            <Input placeholder="https://..." className="dark-input" />
          </Form.Item>

          <Form.Item
            name="text"
            label={<span className="dark-label">Testimonial</span>}
            rules={[{ required: true, message: "Please enter the testimonial text" }]}
          >
            <Input.TextArea rows={4} placeholder="What did they say?" className="dark-input" />
          </Form.Item>

          <Form.Item name="isVisible" label={<span className="dark-label">Visible</span>} valuePropName="checked">
            <Switch defaultChecked={false} />
          </Form.Item>

          <div className="flex justify-end gap-3 mt-4">
            <Button className="secondary-btn" onClick={() => setAddModalVisible(false)}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" className="primary-btn" loading={loading}>
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ClientTestimonial);
