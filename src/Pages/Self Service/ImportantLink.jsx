import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, notification, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import HOC from '../../Component/HOC/HOC';
import api from '../../api/axios';

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
      notification.error({ message: 'Failed to save link', description: error.message });
    }
  };

  const handleEdit = (link) => {
    setEditingLink(link);
    form.setFieldsValue(link);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      render: (url) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {url}
        </a>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this link?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Link
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={links}
        rowKey="_id"
        loading={loading}
        bordered
      />
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
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter the name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter the URL' }]}
          >
            <Input placeholder="Enter URL" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ImportantLink);