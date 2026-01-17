import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import "./Teachers.css";
import {
  Button,
  Descriptions,
  Avatar,
  Spin,
  Typography,
  Tag,
  Space
} from "antd";
import {
  ArrowLeftOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  DownloadOutlined,
  CalendarOutlined
} from "@ant-design/icons";

const { Title, Text } = Typography;

const TeacherProfile = () => {
  const { id } = useParams(); // Get teacher ID from the route
  const navigate = useNavigate();
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const response = await api.get(`/admin/getProfile/${id}`);
        if (response.status === 200) {
          setTeacherDetails(response.data.data);
        } else {
          console.error("Failed to fetch teacher details");
        }
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "NA";
    const initials = name?.split(" ").map((n) => n[0]);
    return initials?.length > 1
      ? initials[0] + initials[1]
      : initials[0] || "NA";
  };

  if (loading) {
    return (
      <div className="teachers-container flexitems-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!teacherDetails) {
    return (
      <div className="teachers-container">
        <p className="text-white">Teacher details not found</p>
        <Button onClick={() => navigate("/teachers")}>Go Back</Button>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    experience,
    document,
    image,
  } = teacherDetails;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim();

  return (
    <div className="teachers-container">
      {/* Header Section */}
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined style={{ fontSize: '20px', color: '#fff' }} />}
            onClick={() => navigate("/teachers")}
          />
          <div>
            <h1 className="page-title">Teacher Profile</h1>
            <p className="page-subtitle">View detailed information about {fullName}</p>
          </div>
        </div>
      </div>

      {/* Main Profile Card */}
      <div className="glass-card" style={{ padding: '32px' }}>
        <div className="teacher-profile-header">
          {image ? (
            <Avatar src={image} size={100} className="teacher-avatar" />
          ) : (
            <Avatar size={100} className="teacher-avatar" style={{ backgroundColor: '#2563eb', fontSize: '32px' }}>
              {getInitials(fullName)}
            </Avatar>
          )}
          <div className="teacher-info">
            <h1>{fullName}</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div className="flex items-center gap-4">
                <Tag icon={<UserOutlined />} color="geekblue">Teacher</Tag>
                {experience && <Tag icon={<CalendarOutlined />} color="purple">{experience} Years Experience</Tag>}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div style={{ marginTop: '24px' }}>
          <Title level={4} className="text-white" style={{ marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '12px' }}>
            Personal Information
          </Title>

          <Descriptions
            layout="vertical"
            column={{ xxl: 3, xl: 3, lg: 2, md: 2, sm: 1, xs: 1 }}
            contentStyle={{ color: '#fff', fontWeight: 500 }}
            labelStyle={{ color: '#888' }}
          >
            <Descriptions.Item label="First Name">{firstName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Last Name">{lastName || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space>
                <MailOutlined style={{ color: '#60a5fa' }} />
                {email || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
              <Space>
                <PhoneOutlined style={{ color: '#4ade80' }} />
                {phone || 'N/A'}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Experience">
              {experience ? `${experience} Years` : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Uploaded Documents">
              {document ? (
                <Button
                  type="primary"
                  ghost
                  icon={<DownloadOutlined />}
                  href={document}
                  target="_blank"
                  download
                >
                  Download Document
                </Button>
              ) : (
                <Text type="secondary">No document available</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>
    </div>
  );
};

export default HOC(TeacherProfile);
