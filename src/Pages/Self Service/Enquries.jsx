import React, { useState, useEffect } from "react";
import { Table, Typography, Spin, Modal } from "antd";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import { Color } from "antd/es/color-picker";

const { Title } = Typography;

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]); // State to store enquiries data
  const [loading, setLoading] = useState(true); // State for loading spinner
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
  const [modalContent, setModalContent] = useState(""); // State for modal content

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await api.get("/enquiries");
        setEnquiries(response.data);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  // Show the modal with the full description
  const handleShowModal = (description) => {
    setModalContent(description);
    setIsModalVisible(true);
  };

  // Close the modal
  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalContent("");
  };

  // Define columns for the Ant Design Table
  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Phone",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <span
          onMouseEnter={() => handleShowModal(description)}
          className="cursor-pointer">
          {description.length > 30
            ? `${description.substring(0, 30)}...`
            : description}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title style={{ color: "white" }} level={2} className=" mb-4">
        Enquiries
      </Title>

      <div className="bg-white p-4 shadow-md rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={enquiries}
            columns={columns}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
          />
        )}
        <Modal
          visible={isModalVisible}
          title="Full Description"
          onCancel={handleCloseModal}
          footer={null}
          maskClosable
          centered
          destroyOnClose>
          <p>{modalContent}</p>
        </Modal>
      </div>
    </div>
  );
};

export default HOC(Enquiries);
