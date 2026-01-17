import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import "./Students.css";
import {
  Typography,
  Button,
  Avatar,
  Descriptions,
  List,
  Tag,
  Card,
  Space,
  Skeleton,
  Tooltip
} from "antd";
import {
  ArrowLeftOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  ReadOutlined,
  HistoryOutlined
} from "@ant-design/icons";
import { AssignmentView } from '../User Management/AssignmentView';
import UserTimelineModal from "./UserTimelineModal";

const { Title, Text } = Typography;

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timeline Modal State
  const [timelineModalVisible, setTimelineModalVisible] = useState(false);
  const [selectedCourseForTimeline, setSelectedCourseForTimeline] = useState(null);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await api.get(`/admin/getProfile/${id}`);
        if (response.status === 200) {
          setStudentDetails(response.data.data);
        } else {
          console.error("Failed to fetch student details");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "NA";
    const initials = name?.split(" ").map((n) => n[0]);
    return initials?.length > 1
      ? (initials[0] + initials[1]).toUpperCase()
      : (initials[0] || "NA").toUpperCase();
  };

  const handleViewTimeline = (course) => {
    setSelectedCourseForTimeline(course);
    setTimelineModalVisible(true);
  };

  const closeTimelineModal = () => {
    setTimelineModalVisible(false);
    setSelectedCourseForTimeline(null);
  };

  if (loading) {
    return (
      <div className="students-container">
        <div style={{ maxWidth: 1200, margin: '0 auto', paddingTop: 40 }}>
          <Skeleton active avatar paragraph={{ rows: 4 }} />
        </div>
      </div>
    );
  }

  if (!studentDetails) {
    return (
      <div className="students-container flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-white text-2xl mb-4">Student not found</h2>
          <Button onClick={() => navigate("/students")} type="primary">Go Back</Button>
        </div>
      </div>
    );
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    image,
    createdAt,
    purchasedCourses,
  } = studentDetails;

  const fullName = `${firstName || ''} ${lastName || ''}`.trim() || 'Unknown Student';

  return (
    <div className="students-container">
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Navigation */}
        <div className="mb-6">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-gray-400 hover:text-white"
            onClick={() => navigate("/students")}
          >
            Back to Students
          </Button>
        </div>

        {/* Header Profile Card */}
        <div className="glass-card student-profile-header p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-600/20 to-purple-600/20 z-0 bg-blue-600" style={{ position: 'absolute', opacity: 0.2 }}></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 w-full" style={{ zIndex: 10, display: 'flex', alignItems: 'center' }}>
            <div className="student-avatar">
              {image ? (
                <Avatar
                  src={image}
                  size={120}
                  className="border-4 border-black shadow-xl"
                />
              ) : (
                <Avatar
                  size={120}
                  className="border-4 border-black shadow-xl bg-blue-600 flex items-center justify-center text-4xl font-bold"
                  style={{ fontSize: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {getInitials(fullName)}
                </Avatar>
              )}
            </div>

            <div className="student-info text-center md:text-left flex-1" style={{ flex: 1 }}>
              <h1 className="text-4xl font-bold text-white mb-2">{fullName}</h1>
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-gray-400">
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                  <MailOutlined className="text-blue-400" /> {email || "No Email"}
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                  <PhoneOutlined className="text-green-400" /> {phone || "No Phone"}
                </span>
                <span className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full text-sm">
                  <CalendarOutlined className="text-purple-400" /> Joined {createdAt ? new Date(createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>

            <div className="flex gap-3 relative z-10">
              <div className="text-center px-6 py-2 bg-white/5 rounded-lg border border-white/10">
                <div className="text-2xl font-bold text-blue-400">{purchasedCourses?.length || 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Courses</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* Left Column: Basic Details */}
          <div className="lg:col-span-1">
            <div className="glass-card h-full p-4">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                <UserOutlined /> Personal Information
              </h3>

              <div className="space-y-6">
                <div className="detail-item">
                  <span className="detail-label">First Name</span>
                  <div className="detail-value">{firstName || '-'}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Last Name</span>
                  <div className="detail-value">{lastName || '-'}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email Address</span>
                  <div className="detail-value text-blue-400" style={{ wordBreak: 'break-all' }}>{email || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Phone Number</span>
                  <div className="detail-value">{phone || "N/A"}</div>
                </div>
                <div className="detail-item">
                  <span className="detail-label">User ID</span>
                  <div className="detail-value font-mono text-xs text-gray-500 bg-white/5 p-2 rounded inline-block" style={{ wordBreak: 'break-all' }}>
                    {studentDetails._id}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Courses & Assignments */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Purchased Courses */}
            <div className="glass-card p-4">
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2 border-b border-gray-800 pb-4">
                <ReadOutlined /> Enrolled Courses
              </h3>

              <List
                itemLayout="horizontal"
                dataSource={purchasedCourses}
                locale={{ emptyText: <span className="text-gray-500">No courses purchased yet.</span> }}
                renderItem={(item) => {
                  const courseId = item.course?._id || item.course;
                  const isInstallment = item.paymentType === 'installment';

                  return (
                    <List.Item
                      className="border-b border-gray-800 last:border-0 hover:bg-white/5 transition-colors px-4 -mx-4"
                      actions={[
                        isInstallment && (
                          <Tooltip title="View Payment Timeline">
                            <Button
                              type="link"
                              icon={<HistoryOutlined />}
                              onClick={() => handleViewTimeline(item.course)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                            >
                              Timeline
                            </Button>
                          </Tooltip>
                        )
                      ].filter(Boolean)}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            shape="square"
                            size={48}
                            src={item.course?.thumbnail}
                            icon={<ReadOutlined />}
                            className="bg-white/5"
                          />
                        }
                        title={
                          <Link to={`/courses_tests/courses/allcourses`} className="text-blue-400 hover:text-blue-300 text-base font-medium">
                            {item.course?.title || "Untitled Course"}
                          </Link>
                        }
                        description={
                          <div className="space-y-1">
                            <span className="text-gray-500 text-xs block">
                              Enrolled on {item.purchaseDate ? new Date(item.purchaseDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date'}
                            </span>
                            {isInstallment && (
                              <Tag color="purple" bordered={false} className="text-[10px] px-1 m-0">
                                Installment Plan
                              </Tag>
                            )}
                          </div>
                        }
                      />
                      <div className="hidden sm:block">
                        <Tag color="blue" className="m-0">Active</Tag>
                      </div>
                    </List.Item>
                  );
                }}
              />
            </div>

            {/* Assignments Section */}
            <AssignmentView userId={id} userName={fullName} embedded={true} />

          </div>
        </div>
      </div>

      {/* Installment Timeline Modal */}
      <UserTimelineModal
        visible={timelineModalVisible}
        onCancel={closeTimelineModal}
        userId={id}
        courseId={selectedCourseForTimeline?._id}
        courseTitle={selectedCourseForTimeline?.title}
      />
    </div>
  );
};

export default HOC(StudentProfile);
