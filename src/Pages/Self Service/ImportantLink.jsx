import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, notification, Popconfirm, Tooltip, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, DatabaseOutlined, LinkOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import HOC from '../../Component/HOC/HOC';
import api from '../../api/axios';
import './SelfService.css';

const { confirm } = Modal;

const ImportantLink = () => {
  const [links, setLinks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingLink, setEditingLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/importantLinks');
      setLinks(response.data.links);
    } catch (error) {
      notification.error({ message: 'Failed to fetch links', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure you want to delete this link?',
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
      await api.delete(`/admin/importantLink/${id}`);
      notification.success({ message: 'Link deleted successfully' });
      fetchLinks();
    } catch (error) {
      notification.error({ message: 'Failed to delete link', description: error.message });
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingLink) {
        await api.patch(`/admin/importantLink/${editingLink._id}`, values);
        notification.success({ message: 'Link updated successfully' });
      } else {
        await api.post('/admin/importLink', values);
        notification.success({ message: 'Link created successfully' });
      }
      fetchLinks();
      setIsModalOpen(false);
      setEditingLink(null);
      form.resetFields();
    } catch (error) {
      // Form validation error or API error
      if (error.message) {
        notification.error({ message: 'Failed to save link', description: error.message });
      }
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    form.setFieldsValue(link);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLink(null);
    form.resetFields();
    setIsModalOpen(true);
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-semibold text-white">{text}</span>
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 flex items-center gap-1">
          <LinkOutlined /> {url}
        </a>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
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
          <h1 className="page-title">🔗 Important Links</h1>
          <p className="page-subtitle">Manage external links and resources.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={handleCreate}>
          <PlusOutlined /> Add Link
        </button>
      </div>

      <div className="glass-card p-6">
        <Table
          columns={columns}
          dataSource={links}
          rowKey="_id"
          loading={loading}
          className="dark-table"
          pagination={{ pageSize: 8 }}
        />
      </div>

      <Modal
        title={editingLink ? 'Edit Link' : 'Add Link'}
        visible={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingLink(null);
          form.resetFields();
        }}
        onOk={handleSubmit}
        okText="Save"
        className="dark-modal"
        destroyOnClose
        footer={[
          <Button key="back" className="secondary-btn" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" className="primary-btn" onClick={handleSubmit}>
            Save
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label={<span className="dark-label">Name</span>}
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter link name" className="dark-input" />
          </Form.Item>
          <Form.Item
            name="url"
            label={<span className="dark-label">URL</span>}
            rules={[
              { required: true, message: 'Please enter the URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input placeholder="https://example.com" className="dark-input" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ImportantLink);