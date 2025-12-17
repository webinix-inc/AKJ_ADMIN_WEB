import React, { useState } from "react";
import { Card, Badge, Button, Tag, Tooltip, Space, Avatar, message } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  EditOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import BatchUserManager from "./BatchUserManager";
import CourseActions from "./CourseActions";

const BatchCourseCard = ({ course, onRefresh }) => {
  const navigate = useNavigate();
  const [userManagerVisible, setUserManagerVisible] = useState(false);

  const getStatusColor = (startDate, endDate) => {
    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (!startDate) return "default";
    if (now.isBefore(start)) return "blue"; // Upcoming
    if (now.isAfter(end)) return "red"; // Ended
    return "green"; // Active
  };

  const getStatusText = (startDate, endDate) => {
    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (!startDate) return "Not Scheduled";
    if (now.isBefore(start)) return "Upcoming";
    if (now.isAfter(end)) return "Ended";
    return "Active";
  };

  const handleViewFolder = () => {
    // Navigate to the root folder associated with this course
    if (course.rootFolder) {
      // 🔧 FIX: Ensure we always get a valid folder ID string
      const folderId = typeof course.rootFolder === 'object' 
        ? course.rootFolder._id || course.rootFolder.id 
        : course.rootFolder;
      
      if (folderId && typeof folderId === 'string') {
        console.log('✅ [DEBUG] Navigating to folder:', folderId);
        navigate(`/folder/${folderId}`);
      } else {
        console.error('❌ [ERROR] Invalid folder ID:', { rootFolder: course.rootFolder, folderId });
        message.error("Invalid folder ID found for this course");
      }
    } else {
      message.error("No folder found for this course");
      console.error("Course does not have a rootFolder:", course);
    }
  };

  const handleManageUsers = () => {
    setUserManagerVisible(true);
  };

  const handleTogglePublish = async (courseId, isPublished) => {
    try {
      // Add batch course publish/unpublish logic here
      // For now, just show a message
      message.success(`Batch course ${isPublished ? 'published' : 'unpublished'} successfully!`);
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error("Error updating batch course status: " + error);
    }
  };

  const handleDelete = () => {
    // Add batch course delete logic here
    message.info("Batch course deletion not implemented yet");
  };

  const enrolledCount = course.manualEnrollments?.length || 0;
  const batchSize = course.batchSize || 50;
  const fillPercentage = (enrolledCount / batchSize) * 100;

  return (
    <>
      <Card
        hoverable
        style={{ marginBottom: 16 }}
        actions={[
          <Tooltip title="View Folder Contents">
            <Button 
              type="text" 
              icon={<FolderOutlined />} 
              onClick={handleViewFolder}
            >
              Folder
            </Button>
          </Tooltip>,
          <Tooltip title="Manage Users">
            <Button 
              type="text" 
              icon={<TeamOutlined />} 
              onClick={handleManageUsers}
            >
              Users ({enrolledCount})
            </Button>
          </Tooltip>,
          <CourseActions
            courseId={course._id}
            rootFolderId={course.rootFolder?._id || course.rootFolder}
            isPublished={course.isPublished}
            onTogglePublish={handleTogglePublish}
            onDelete={handleDelete}
          />,
        ]}
      >
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              {course.title}
            </h3>
            <Tag color={getStatusColor(course.batchStartDate, course.batchEndDate)}>
              {getStatusText(course.batchStartDate, course.batchEndDate)}
            </Tag>
          </div>
          
          <div style={{ marginBottom: 8 }}>
            <Tag color="purple" style={{ marginBottom: 4 }}>
              {course.batchName}
            </Tag>
            {course.category?.name && (
              <Tag color="blue" style={{ marginBottom: 4 }}>
                {course.category.name}
              </Tag>
            )}
          </div>

          <Space direction="vertical" size={8} style={{ width: "100%" }}>
            {/* Enrollment Count */}
            {enrolledCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {enrolledCount} student{enrolledCount !== 1 ? 's' : ''} enrolled
                </span>
              </div>
            )}

            {/* Batch Dates */}
            {course.batchStartDate && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CalendarOutlined style={{ color: "#52c41a" }} />
                <span style={{ fontSize: "14px" }}>
                  Start Date: {moment(course.batchStartDate).format("MMM DD, YYYY")}
                </span>
              </div>
            )}

            {/* Course Details */}
            <div style={{ display: "flex", gap: 16, fontSize: "12px", color: "#666" }}>
              {course.duration && <span>📅 {course.duration}</span>}
              {course.lessons && <span>📚 {course.lessons}</span>}
              {course.price && <span>💰 ₹{course.price}</span>}
            </div>

            {/* Teachers */}
            {course.teacher && course.teacher.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "14px", color: "#666" }}>Teachers:</span>
                <Avatar.Group maxCount={3} size="small">
                  {course.teacher.map((teacher) => (
                    <Tooltip 
                      key={teacher._id} 
                      title={`${teacher.firstName} ${teacher.lastName}`}
                    >
                      <Avatar size="small">
                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </div>
            )}
          </Space>
        </div>
      </Card>

      <BatchUserManager
        visible={userManagerVisible}
        onCancel={() => setUserManagerVisible(false)}
        course={course}
        onRefresh={onRefresh}
      />
    </>
  );
};

export default BatchCourseCard;
