import React, { useEffect, useState } from "react";
import HOC from "../../Component/HOC/HOC";
import "./Students.css";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import {
  Select,
  DatePicker,
  Input,
  Table,
  Space,
  Tooltip,
  Avatar
} from "antd";
import {
  SearchOutlined,
  CalendarOutlined,
  PhoneOutlined,
  MailOutlined,
  EyeOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

const Students = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  const [dateFilter, setDateFilter] = useState("all");
  const [customRange, setCustomRange] = useState([null, null]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/admin/getAllProfile");
        if (response.status === 200) {
          // Filter only users with userType USER
          const filteredData = response.data.data.filter(
            (user) => user.userType === "USER"
          );
          setStudentsData(filteredData);
        } else {
          console.error("Failed to fetch students data");
        }
      } catch (error) {
        console.error("Error fetching students data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return "NA";
    const initials = name.split(" ").map((n) => n[0]?.toUpperCase());
    return initials.length > 1
      ? initials[0] + initials[1]
      : initials[0] || "NA";
  };

  const filteredStudents = studentsData.filter((student) => {
    const fullName = `${student.firstName ?? ""} ${student.lastName ?? ""
      }`.toLowerCase();
    const email = (student.email ?? "").toLowerCase();
    const phone = String(student.phone ?? "").toLowerCase();

    const matchesSearch =
      fullName.includes(searchTerm) ||
      email.includes(searchTerm) ||
      phone.includes(searchTerm);

    let matchesDate = true;
    const createdAt = dayjs(student.createdAt);

    if (dateFilter === "today") {
      matchesDate = createdAt.isSame(dayjs(), "day");
    } else if (dateFilter === "thisMonth") {
      matchesDate = createdAt.isSame(dayjs(), "month");
    } else if (dateFilter === "custom" && customRange[0] && customRange[1]) {
      matchesDate =
        createdAt.isAfter(customRange[0].startOf("day")) &&
        createdAt.isBefore(customRange[1].endOf("day"));
    }

    return matchesSearch && matchesDate;
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const columns = [
    {
      title: 'Student',
      dataIndex: 'image',
      key: 'image',
      width: 80,
      render: (image, record) => (
        <Link to={`/students/studentprofile/${record._id}`}>
          {image ? (
            <Avatar src={image} size={48} className="border border-gray-600" />
          ) : (
            <Avatar size={48} style={{ backgroundColor: '#3b82f6', verticalAlign: 'middle' }}>
              {getInitials(`${record.firstName} ${record.lastName}`)}
            </Avatar>
          )}
        </Link>
      )
    },
    {
      title: 'Full Name',
      key: 'fullName',
      render: (_, record) => (
        <div className="flex flex-col">
          <Link to={`/students/studentprofile/${record._id}`} className="text-white hover:text-blue-400 font-semibold text-base transition-colors">
            {record.firstName} {record.lastName}
          </Link>
          <span className="text-xs text-gray-500">ID: {record._id.slice(-6).toUpperCase()}</span>
        </div>
      ),
      sorter: (a, b) => (a.firstName || "").localeCompare(b.firstName || "")
    },
    {
      title: 'Contact Info',
      key: 'contact',
      render: (_, record) => (
        <div className="flex flex-col gap-1">
          <span className="text-gray-300 flex items-center gap-2">
            <MailOutlined className="text-blue-500" /> {record.email || "N/A"}
          </span>
          <span className="text-gray-400 flex items-center gap-2 text-sm">
            <PhoneOutlined className="text-green-500" /> {record.phone || "N/A"}
          </span>
        </div>
      )
    },
    {
      title: 'Registered On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <Space>
          <CalendarOutlined className="text-gray-500" />
          <span className="text-gray-300">{date ? new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "N/A"}</span>
        </Space>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Tooltip title="View Full Profile">
          <Link to={`/students/studentprofile/${record._id}`}>
            <div className="action-btn">
              <EyeOutlined />
            </div>
          </Link>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="students-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">👨‍🎓 Students Directory</h1>
          <p className="page-subtitle">Manage and view all registered students.</p>
        </div>
        <div className="bg-white/5 px-4 py-2 rounded-lg border border-white/10">
          <span className="text-gray-400 text-sm">Total Students:</span>
          <span className="text-white font-bold ml-2 text-lg">{studentsData.length}</span>
        </div>
      </div>

      <div className="glass-card mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Input
            prefix={<SearchOutlined className="text-gray-500" />}
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value.toLowerCase());
              setCurrentPage(1);
            }}
            className="dark-input"
            style={{ maxWidth: '350px' }}
            allowClear
          />

          <div className="flex flex-wrap gap-3">
            <Select
              value={dateFilter}
              onChange={(value) => {
                setDateFilter(value);
                setCurrentPage(1);
              }}
              className="dark-select"
              dropdownClassName="dark-dropdown"
              style={{ width: 160 }}
              options={[
                { value: "all", label: "All Time" },
                { value: "today", label: "Registered Today" },
                { value: "thisMonth", label: "This Month" },
                { value: "custom", label: "Custom Range" },
              ]}
            />

            {dateFilter === "custom" && (
              <RangePicker
                value={customRange}
                onChange={(dates) => {
                  setCustomRange(dates);
                  setCurrentPage(1);
                }}
                className="dark-picker"
                style={{ width: 260 }}
              />
            )}
          </div>
        </div>
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredStudents}
          loading={loading}
          rowKey="_id"
          pagination={{
            current: currentPage,
            pageSize: studentsPerPage,
            total: filteredStudents.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false,
            className: 'p-4'
          }}
          className="dark-table"
          locale={{ emptyText: <div className="py-8 text-gray-500">No students found matching your criteria.</div> }}
        />
      </div>
    </div>
  );
};

export default HOC(Students);
