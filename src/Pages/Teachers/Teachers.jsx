import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import "./Teachers.css";
import { Link, useNavigate } from "react-router-dom";
import { PlusOutlined, EyeOutlined, SearchOutlined } from "@ant-design/icons";
import api from "../../api/axios";
import {
  Table,
  Button,
  Select,
  Input,
  Card,
  Tooltip,
  Avatar,
  Pagination,
  Row,
  Col,
  Space,
  Typography
} from "antd";

const { Option } = Select;
const { Title, Text } = Typography;

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    experience: "",
    year: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 10; // Increased default per page for better UI

  const [years, setYears] = useState([]);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("/admin/getAllProfile");
        if (response.status === 200) {
          const teacherData = response.data.data.filter(
            (user) => user.userType === "TEACHER"
          );
          setTeachers(teacherData);

          // Extract unique years for filtering
          const uniqueYears = [
            ...new Set(teacherData.map((teacher) => teacher.year)),
          ].sort();
          setYears(uniqueYears);
        } else {
          console.error("Failed to fetch teacher data");
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (value, name) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Apply filters to teacher data
  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (!filters.experience || teacher.experience === filters.experience) &&
      (!filters.year || teacher.year === filters.year)
    );
  });

  // Logic for pagination handled by Ant Design Table, 
  // but preserving original "currentTeachers" slice logic idea if needed for manual paginantion.
  // We will pass filteredTeachers directly to Table with pagination config.

  const getInitials = (firstName, lastName) => {
    const initials =
      (firstName?.[0]?.toUpperCase() || "") +
      (lastName?.[0]?.toUpperCase() || "");
    return initials || "N/A";
  };

  // Columns definition for Ant Design Table
  const columns = [
    {
      title: 'TEACHER',
      key: 'teacher',
      render: (_, record) => (
        <Space size={12}>
          {record.image ? (
            <Avatar src={record.image} size={40} className="student-avatar" />
          ) : (
            <Avatar size={40} style={{ backgroundColor: '#3b82f6' }}>
              {getInitials(record.firstName, record.lastName)}
            </Avatar>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong className="text-white">{record.firstName} {record.lastName}</Text>
            <Text type="secondary" style={{ fontSize: '12px', color: '#888' }}>ID: {record._id.substring(0, 6).toUpperCase()}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <span className="text-gray-300">{text || "N/A"}</span>
    },
    {
      title: 'PHONE NO.',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => <span className="text-gray-300">{text || "N/A"}</span>
    },
    {
      title: 'EXPERIENCE',
      dataIndex: 'experience',
      key: 'experience',
      render: (text) => <span className="text-gray-300">{text ? `${text} Years` : "N/A"}</span>
    },
    {
      title: 'ACTION',
      key: 'action',
      render: (_, record) => (
        <Tooltip title="View Profile">
          <Link to={`/teachers/teacherprofile/${record._id}`}>
            <div className="action-btn">
              <EyeOutlined />
            </div>
          </Link>
        </Tooltip>
      ),
      align: 'center',
    },
  ];

  return (
    <div className="teachers-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Teachers Directory</h1>
          <p className="page-subtitle">Manage and view all registered teachers</p>
        </div>
        <Button
          type="primary"
          className="primary-btn"
          icon={<PlusOutlined />}
          onClick={() => navigate("/teachers/addteacher")}
        >
          Add Teacher
        </Button>
      </div>

      {/* Filters Section */}
      <Card className="glass-card mb-6" bordered={false} bodyStyle={{ padding: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8} lg={6}>
            <label className="dark-label">Experience</label>
            <Select
              className="dark-select w-full"
              placeholder="Filter by Experience"
              style={{ width: '100%' }}
              value={filters.experience || undefined}
              onChange={(val) => handleFilterChange(val, "experience")}
              allowClear
            >
              <Option value="">All</Option>
              <Option value="01">01 Year</Option>
              <Option value="02">02 Years</Option>
              <Option value="03">03 Years</Option>
              <Option value="04">04 Years</Option>
              <Option value="05">05 Years</Option>
              <Option value="06">05+ Years</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <label className="dark-label">Year</label>
            <Select
              className="dark-select w-full"
              placeholder="Filter by Year"
              style={{ width: '100%' }}
              value={filters.year || undefined}
              onChange={(val) => handleFilterChange(val, "year")}
              allowClear
            >
              <Option value="">All</Option>
              {years.map((year) => (
                <Option key={year} value={year}>{year}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table Section */}
      <div className="glass-card">
        <Table
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1000 }}
          pagination={{
            current: currentPage,
            pageSize: teachersPerPage,
            total: filteredTeachers.length,
            onChange: (page) => setCurrentPage(page),
            showSizeChanger: false, // Keeping logic simple as per original
            position: ['bottomCenter'],
            className: 'pagination-center'
          }}
          className="dark-table"
        />
      </div>
    </div>
  );
};

export default HOC(Teachers);
