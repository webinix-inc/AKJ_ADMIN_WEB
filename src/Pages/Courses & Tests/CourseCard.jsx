import {
  CalendarOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FolderOutlined,
  GlobalOutlined,
  UserOutlined
} from "@ant-design/icons";
import { Avatar, Button, Card, Modal, Space, Tag, Tooltip, message } from "antd";
import moment from "moment";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import img from "../../Image/img9.png";
import { deleteCourse, togglePublishCourse } from "../../redux/slices/courseSlice";
import { getOptimizedCourseImage } from "../../utils/imageUtils";
import CourseActions from "./CourseActions";

const CourseCard = ({ course, onRefresh }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const getStatusColor = (startDate, endDate, isPublished) => {
    if (!isPublished) return "default";

    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (!startDate) return "blue";
    if (now.isBefore(start)) return "blue"; // Upcoming
    if (end && now.isAfter(end)) return "red"; // Ended
    return "green"; // Active
  };

  const getStatusText = (startDate, endDate, isPublished) => {
    if (!isPublished) return "Draft";

    const now = moment();
    const start = moment(startDate);
    const end = moment(endDate);

    if (!startDate) return "Published";
    if (now.isBefore(start)) return "Upcoming";
    if (end && now.isAfter(end)) return "Ended";
    return "Active";
  };

  const handleViewFolder = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Prevent card click event
    }
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

  const handleEdit = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Prevent card click event
    }
    navigate(`/courses_tests/courses/edit/${course._id}`);
  };

  const handleCardClick = () => {
    navigate(`/courses_tests/courses/edit/${course._id}`);
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCourse(course._id)).unwrap();
      message.success("Course deleted successfully!");
      setDeleteModalVisible(false);
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error("Error deleting course: " + error);
    }
  };

  const handleTogglePublish = async (courseId, isPublished) => {
    try {
      await dispatch(togglePublishCourse({
        courseId: courseId || course._id,
        isPublished: isPublished
      })).unwrap();
      message.success(
        `Course "${course.title}" successfully ${isPublished ? "published" : "unpublished"}!`
      );
      if (onRefresh) onRefresh();
    } catch (error) {
      message.error("Error updating course publish status: " + error);
    }
  };

  // Calculate enrollment count (this would need to be provided by the API)
  const enrolledCount = course.enrolledStudents?.length || course.studentsEnrolled || 0;

  return (
    <>
      <Card
        hoverable
        style={{ marginBottom: 8, cursor: 'pointer', display: 'flex', flexDirection: 'column', height: '100%' }}
        onClick={handleCardClick}
        cover={
          <div className="overflow-hidden h-40">
            <img
              alt={course?.title || "Course"}
              src={getOptimizedCourseImage(course) || img}
              onError={(e) => { e.target.src = img; }}
              className="object-cover h-full w-full transition-transform duration-300 hover:scale-105"
              crossOrigin="anonymous"
            />
          </div>
        }
        bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
        actions={[
          <Tooltip title="View Course Folder Contents" key="folder">
            <Button
              type="text"
              icon={<FolderOutlined />}
              onClick={handleViewFolder}
              style={{ width: '100%' }}
            >
              Folder
            </Button>
          </Tooltip>,
          <Tooltip title="Edit Course" key="edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={handleEdit}
              style={{ width: '100%' }}
            >
              Edit
            </Button>
          </Tooltip>,
          <Tooltip title={course.isPublished ? "Unpublish Course" : "Publish Course"} key="publish">
            <Button
              type="text"
              icon={course.isPublished ? <EyeInvisibleOutlined /> : <EyeOutlined />}
              onClick={() => handleTogglePublish(course._id, !course.isPublished)}
              style={{
                color: course.isPublished ? "#ff4d4f" : "#52c41a",
                width: '100%'
              }}
            >
              {course.isPublished ? "Unpublish" : "Publish"}
            </Button>
          </Tooltip>,
        ]}
      >
        <div style={{ marginBottom: 8, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600" }}>
              {course.title}
            </h3>
            <Tag color={getStatusColor(course.startDate, course.endDate, course.isPublished)}>
              {getStatusText(course.startDate, course.endDate, course.isPublished)}
            </Tag>
          </div>

          <Space direction="vertical" size={8} style={{ width: "100%", flex: 1 }}>
            {/* Enrollment Count */}
            {enrolledCount > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <UserOutlined style={{ color: "#1890ff" }} />
                <span style={{ fontSize: "14px", fontWeight: "500" }}>
                  {enrolledCount} student{enrolledCount !== 1 ? 's' : ''} enrolled
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
              {/* Dates */}
              {course.startDate && (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <CalendarOutlined style={{ color: "#52c41a" }} />
                  <span style={{ fontSize: "12px" }}>
                    Start: {moment(course.startDate).format("MMM DD, YYYY")}
                    {course.endDate && ` - ${moment(course.endDate).format("MMM DD, YYYY")}`}
                  </span>
                </div>
              )}
              <div>
                {course.category?.name && (
                  <Tag color="blue" style={{ marginBottom: 4, fontSize: "12px" }}>
                    {course.category.name}
                  </Tag>
                )}
                {course.isPublished && (
                  <Tag color="green" style={{ marginBottom: 4, fontSize: "12px" }}>
                    <GlobalOutlined /> Published
                  </Tag>
                )}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
              {/* Course Details */}
              <div style={{ display: "flex", gap: 16, fontSize: "12px", color: "#666" }}>
                {course.duration && <span>📅 {course.duration}</span>}
                {course.lessons && <span>📚 {course.lessons} lessons</span>}
                {course.price && <span>💰 ₹{course.price}</span>}
              </div>
              {/* Course Actions Menu */}
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                <CourseActions
                  courseId={course._id}
                  rootFolderId={course.rootFolder?._id || course.rootFolder}
                  isPublished={course.isPublished}
                  onTogglePublish={handleTogglePublish}
                  onDelete={() => setDeleteModalVisible(true)}
                />
              </div>
            </div>
            {/* Teachers */}
            {course.teacher && course.teacher.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: "14px", color: "#666" }}>Teachers:</span>
                <Avatar.Group maxCount={3} size="small">
                  {course.teacher.map((teacher, index) => (
                    <Tooltip
                      key={teacher._id || index}
                      title={`${teacher.firstName || teacher.name || 'Teacher'} ${teacher.lastName || ''}`}
                    >
                      <Avatar size="small">
                        {(teacher.firstName?.[0] || teacher.name?.[0] || 'T')}{(teacher.lastName?.[0] || '')}
                      </Avatar>
                    </Tooltip>
                  ))}
                </Avatar.Group>
              </div>
            )}
          </Space>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        title="Confirm Deletion"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
        cancelText="Cancel"
      >
        <p>Are you sure you want to delete the course "{course.title}"?</p>
        <p style={{ color: "#ff4d4f", fontSize: "12px" }}>This action cannot be undone.</p>
      </Modal>
    </>
  );
};

export default CourseCard;
