import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Spin,
  Modal,
  DatePicker,
  Button,
  Select,
  Space,
  message,
  Card
} from "antd";
import { ExportOutlined, FilterOutlined, SearchOutlined } from "@ant-design/icons";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import dayjs from "dayjs";
import { exportToCSV } from "../../Component/utils/exportCSV";
import './SelfService.css';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await api.get("/enquiries");
        setEnquiries(response.data);
        setFilteredEnquiries(response.data);
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  useEffect(() => {
    const getFilteredEnquiries = () => {
      if (filterType === "today") {
        const today = dayjs();
        return enquiries.filter((enq) => dayjs(enq.date).isSame(today, "day"));
      }

      if (filterType === "month") {
        const thisMonth = dayjs();
        return enquiries.filter((enq) =>
          dayjs(enq.date).isSame(thisMonth, "month")
        );
      }

      if (filterType === "range" && dateRange.length === 2) {
        const [start, end] = dateRange;
        return enquiries.filter(
          (enq) =>
            dayjs(enq.date).isAfter(start.startOf("day")) &&
            dayjs(enq.date).isBefore(end.endOf("day"))
        );
      }

      return enquiries;
    };
    const result = getFilteredEnquiries();
    setFilteredEnquiries(result);
  }, [filterType, dateRange, enquiries]);

  const handleShowModal = (description) => {
    setModalContent(description);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalContent("");
  };

  const handleExport = () => {
    if (filteredEnquiries.length === 0) {
      message.info("No enquiries match the selected filter.");
      return;
    }

    const formatted = filteredEnquiries.map(
      ({ date, fullName, email, courseName, description }) => ({
        Date: new Date(date).toLocaleString(),
        Name: fullName,
        Email: email,
        Course: courseName,
        Description: description,
      })
    );

    exportToCSV(formatted, "enquiries.csv");
  };

  const columns = [
    {
      title: "Date & Time",
      dataIndex: "date",
      key: "date",
      render: (date) => <span className="text-gray-300">{dayjs(date).format('DD MMM YYYY, hh:mm A')}</span>,
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
      defaultSortOrder: 'descend',
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <span className="font-semibold text-white">{text}</span>,
    },
    {
      title: "Contact / Email",
      dataIndex: "email",
      key: "email",
      render: (text) => <span className="text-blue-300">{text}</span>,
    },
    {
      title: "Interested Course",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <span className="bg-blue-900 text-blue-200 px-2 py-1 rounded text-xs">{text}</span>,
    },
    {
      title: "Message",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <span
          className="cursor-pointer text-gray-400 hover:text-white transition-colors"
          onClick={() => handleShowModal(description)}
        >
          {description.length > 40 ? `${description.substring(0, 40)}...` : description}
        </span>
      ),
    },
  ];

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📩 Enquiries</h1>
          <p className="page-subtitle">View and manage student enquiries from your website.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={handleExport}>
          <ExportOutlined /> Export CSV
        </button>
      </div>

      <div className="glass-card p-6">
        <div className="flex flex-wrap gap-4 mb-6 items-center bg-gray-900 bg-opacity-40 p-4 rounded-xl">
          <span className="text-gray-300 font-medium"><FilterOutlined /> Filter By:</span>
          <Select
            placeholder="Select Filter"
            onChange={(value) => setFilterType(value)}
            value={filterType}
            className="dark-select w-40"
            dropdownClassName="dark-dropdown"
          >
            <Option value="all">All Time</Option>
            <Option value="today">Today</Option>
            <Option value="month">This Month</Option>
            <Option value="range">Custom Range</Option>
          </Select>

          {filterType === "range" && (
            <RangePicker
              onChange={(dates) => setDateRange(dates)}
              value={dateRange}
              className="dark-input"
            />
          )}
        </div>

        <Table
          dataSource={filteredEnquiries}
          columns={columns}
          rowKey="_id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            className: "dark-pagination"
          }}
          className="dark-table"
        />
      </div>

      <Modal
        visible={isModalVisible}
        title="Enquiry Details"
        onCancel={handleCloseModal}
        footer={[
          <Button key="close" onClick={handleCloseModal}>Close</Button>
        ]}
        className="dark-modal"
        width={600}
      >
        <p className="text-gray-300 leading-relaxed text-base">{modalContent}</p>
      </Modal>
    </div>
  );
};

export default HOC(Enquiries);
