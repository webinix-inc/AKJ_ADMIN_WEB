import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Switch, message } from "antd";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";

const ClientTestimonial = () => {
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await api.get("admin/testimonial");

        // Assuming `response.data` is an array and has a field like `createdAt`
        const sortedTestimonials = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setTestimonials(sortedTestimonials);
      } catch (error) {
        console.error("Error fetching testimonials:", error);
      }
    };

    fetchTestimonials();
  }, []);

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
      const response = await api.post("admin/testimonial", values);
      setTestimonials([...testimonials, response.data]);
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
    setLoading(true);
    try {
      // Update the testimonial on the server
      const response = await api.put(`admin/testimonial/${id}`, updatedFields);
      // Update the state only after successful API response
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
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Image",
      dataIndex: "imageUrl",
      key: "imageUrl",
      render: (url) => (
        <img
          src={url}
          alt="testimonial"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            borderRadius: "4px",
          }}
        />
      ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Text",
      dataIndex: "text",
      key: "text",
      ellipsis: true,
    },
    {
      title: "Visible",
      dataIndex: "isVisible",
      key: "isVisible",
      render: (isVisible, record) => (
        <Switch
          checked={isVisible}
          onChange={(checked) => handleEdit(record._id, { isVisible: checked })}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button danger onClick={() => handleDelete(record._id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="p-4">
      <div className=" flex gap-2">
        <FaArrowLeft
          color="#000"
          size={20}
          onClick={() => navigate("/selfservice")}
          className="cursor-pointer mb-4 text-white"
        />
        <h2 className=" -mt-2 text-white">Client Testimonials</h2>
      </div>

      {/* <Button type="primary" onClick={() => setAddModalVisible(true)}>
        Add Testimonial
      </Button> */}

      {/* Testimonials Table */}
      <Table
        columns={columns}
        dataSource={testimonials}
        rowKey="_id"
        className="mt-4"
      />

      {/* Add Testimonial Modal */}
      <Modal
        title="Add Testimonial"
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        footer={null}>
        <Form layout="vertical" form={form} onFinish={handleAddTestimonial}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}>
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="text"
            label="Testimonial"
            rules={[
              { required: true, message: "Please enter the testimonial text" },
            ]}>
            <Input.TextArea rows={4} placeholder="Enter testimonial text" />
          </Form.Item>
          <Form.Item name="isVisible" label="Visible" valuePropName="checked">
            <Switch defaultChecked={false} />
          </Form.Item>
          <div className="flex justify-end">
            <Button onClick={() => setAddModalVisible(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Submit
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ClientTestimonial);
