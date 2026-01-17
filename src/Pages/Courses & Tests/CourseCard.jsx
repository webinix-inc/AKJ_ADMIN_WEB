import {
  CalendarOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FolderOutlined,
  UserOutlined,
  BookOutlined
} from "@ant-design/icons";
import { Modal, message } from "antd";
import moment from "moment";
import React, { useState, memo, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { deleteCourse, togglePublishCourse } from "../../redux/slices/courseSlice";
import { getOptimizedCourseImage } from "../../utils/imageUtils";
import CourseActions from "./CourseActions";

// Gradient colors for placeholder
const gradients = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
];

const CourseCard = memo(({ course, onRefresh, index = 0 }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [shouldLoadImage, setShouldLoadImage] = useState(false);

  // Progressive loading: First 4 cards load immediately (LCP optimization), rest defer
  const isAboveFold = index < 4;

  useEffect(() => {
    // First 4 cards load immediately for LCP
    if (isAboveFold) {
      setShouldLoadImage(true);
      return;
    }

    // Use requestIdleCallback if available, otherwise setTimeout
    const loadImage = () => setShouldLoadImage(true);

    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(loadImage, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    } else {
      const timer = setTimeout(loadImage, 500);
      return () => clearTimeout(timer);
    }
  }, [isAboveFold]);

  const status = (() => {
    if (!course.isPublished) return { label: "Draft", color: "#fbbf24" };
    const now = moment();
    if (course.startDate && now.isBefore(moment(course.startDate))) return { label: "Upcoming", color: "#3b82f6" };
    if (course.endDate && now.isAfter(moment(course.endDate))) return { label: "Ended", color: "#ef4444" };
    return { label: "Active", color: "#22c55e" };
  })();

  const handleViewFolder = useCallback((e) => {
    e?.stopPropagation?.();
    const folderId = typeof course.rootFolder === 'object' ? course.rootFolder._id : course.rootFolder;
    if (folderId) navigate(`/folder/${folderId}`);
    else message.error("No folder found");
  }, [course.rootFolder, navigate]);

  const handleEdit = useCallback((e) => {
    e?.stopPropagation?.();
    navigate(`/courses_tests/courses/edit/${course._id}`);
  }, [course._id, navigate]);

  const handleTogglePublish = useCallback(async (courseId, isPublished) => {
    try {
      await dispatch(togglePublishCourse({ courseId: courseId || course._id, isPublished })).unwrap();
      message.success(`Course ${isPublished ? "published" : "unpublished"}`);
      onRefresh?.();
    } catch (error) {
      message.error("Error: " + error);
    }
  }, [course._id, dispatch, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      await dispatch(deleteCourse(course._id)).unwrap();
      message.success("Course deleted");
      setDeleteModalVisible(false);
      onRefresh?.();
    } catch (error) {
      message.error("Error: " + error);
    }
  }, [course._id, dispatch, onRefresh]);

  const enrolled = course.enrolledStudents?.length || course.studentsEnrolled || 0;
  const imgSrc = getOptimizedCourseImage(course);
  const gradient = gradients[index % gradients.length];

  return (
    <>
      <div
        onClick={() => navigate(`/courses_tests/courses/edit/${course._id}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          borderRadius: '12px',
          overflow: 'hidden',
          background: '#171717',
          border: '1px solid #262626',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Image Container */}
        <div style={{
          position: 'relative',
          height: '140px',
          background: gradient,
          overflow: 'hidden',
        }}>
          {/* Placeholder - shows gradient with icon until image loads */}
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: imageLoaded ? 0 : 1,
            transition: 'opacity 0.3s',
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              borderRadius: '12px',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <BookOutlined style={{ fontSize: '24px', color: '#fff' }} />
            </div>
          </div>

          {/* Actual Image - loads after page is ready */}
          {shouldLoadImage && imgSrc && (
            <img
              src={imgSrc}
              alt=""
              loading={isAboveFold ? "eager" : "lazy"}
              fetchPriority={isAboveFold ? "high" : "auto"}
              decoding={isAboveFold ? "sync" : "async"}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            />
          )}

          {/* Gradient overlay for text readability */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to top, rgba(23,23,23,0.9) 0%, transparent 100%)',
            pointerEvents: 'none',
          }} />

          {/* Status Badge */}
          <span style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            color: status.color,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
          }}>
            {status.label}
          </span>

          {/* Category Badge */}
          {course.category?.name && (
            <span style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#fff',
              background: 'rgba(59,130,246,0.8)',
            }}>
              {course.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          <h3 style={{
            margin: '0 0 12px',
            fontSize: '15px',
            fontWeight: '600',
            color: '#fafafa',
            lineHeight: 1.4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {course.title}
          </h3>

          <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a3a3a3' }}>
              <CalendarOutlined style={{ fontSize: '12px' }} />
              {course.startDate ? moment(course.startDate).format("MMM DD") : "No date"}
            </span>
            {enrolled > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a3a3a3' }}>
                <UserOutlined style={{ fontSize: '12px' }} />
                {enrolled}
              </span>
            )}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '14px',
          }}>
            <span style={{ fontSize: '12px', color: '#737373' }}>
              {course.duration || ""}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleViewFolder} style={btnStyle}>
              <FolderOutlined /> Folder
            </button>
            <button onClick={handleEdit} style={btnStyle}>
              <EditOutlined /> Edit
            </button>

            <div onClick={(e) => e.stopPropagation()}>
              <CourseActions
                courseId={course._id}
                rootFolderId={course.rootFolder?._id || course.rootFolder}
                isPublished={course.isPublished}
                onTogglePublish={handleTogglePublish}
                onDelete={() => setDeleteModalVisible(true)}
                subscriptionCount={course.subscriptionCount}
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Delete Course"
        open={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onOk={handleDelete}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Delete "{course.title}"? This cannot be undone.</p>
      </Modal>
    </>
  );
});

const btnStyle = {
  flex: 1,
  padding: '8px 0',
  borderRadius: '8px',
  border: '1px solid #404040',
  background: 'transparent',
  color: '#d4d4d4',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '4px',
};

CourseCard.displayName = 'CourseCard';
export default CourseCard;
