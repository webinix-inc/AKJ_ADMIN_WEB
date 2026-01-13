import React, { useState, memo, useCallback, lazy, Suspense } from "react";
import { message } from "antd";
import {
  CalendarOutlined,
  TeamOutlined,
  UserOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import CourseActions from "./CourseActions";

const BatchUserManager = lazy(() => import("./BatchUserManager"));

const BatchCourseCard = memo(({ course, onRefresh }) => {
  const navigate = useNavigate();
  const [userManagerVisible, setUserManagerVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  const status = (() => {
    const now = moment();
    if (!course.batchStartDate) return { label: "Not Set", color: "#fbbf24" };
    if (now.isBefore(moment(course.batchStartDate))) return { label: "Upcoming", color: "#3b82f6" };
    if (course.batchEndDate && now.isAfter(moment(course.batchEndDate))) return { label: "Ended", color: "#ef4444" };
    return { label: "Active", color: "#22c55e" };
  })();

  const handleViewFolder = useCallback((e) => {
    e?.stopPropagation?.();
    const folderId = typeof course.rootFolder === 'object' ? course.rootFolder._id : course.rootFolder;
    if (folderId) navigate(`/folder/${folderId}`);
    else message.error("No folder found");
  }, [course.rootFolder, navigate]);

  const handleManageUsers = useCallback((e) => {
    e?.stopPropagation?.();
    setUserManagerVisible(true);
  }, []);

  const handleTogglePublish = useCallback(async (courseId, isPublished) => {
    message.success(`Batch ${isPublished ? 'published' : 'unpublished'}`);
    onRefresh?.();
  }, [onRefresh]);

  const handleDelete = useCallback(() => {
    message.info("Delete not implemented");
  }, []);

  const enrolled = course.manualEnrollments?.length || 0;
  const batchSize = course.batchSize || 50;
  const progress = Math.round((enrolled / batchSize) * 100);

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
          transition: 'all 0.2s ease',
          transform: hovered ? 'translateY(-4px)' : 'none',
          boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          background: '#1f1f1f',
          borderBottom: '1px solid #262626',
        }}>
          {/* Top Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#fff',
              background: '#7c3aed',
            }}>
              {course.batchName}
            </span>
            <span style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '600',
              color: status.color,
              background: `${status.color}20`,
              border: `1px solid ${status.color}40`,
            }}>
              {status.label}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            margin: 0,
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

          {course.category?.name && (
            <span style={{
              display: 'inline-block',
              marginTop: '8px',
              padding: '3px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#a3a3a3',
              background: '#262626',
            }}>
              {course.category.name}
            </span>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '16px' }}>
          {/* Progress */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '13px', color: '#a3a3a3', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserOutlined style={{ fontSize: '12px' }} />
                {enrolled} / {batchSize}
              </span>
              <span style={{ fontSize: '13px', color: '#a3a3a3', fontWeight: '600' }}>{progress}%</span>
            </div>
            <div style={{ height: '6px', background: '#262626', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(progress, 100)}%`,
                background: '#7c3aed',
                borderRadius: '3px',
                transition: 'width 0.3s',
              }} />
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#a3a3a3' }}>
              <CalendarOutlined style={{ fontSize: '12px' }} />
              {course.batchStartDate ? moment(course.batchStartDate).format("MMM DD") : "No date"}
            </span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#a78bfa' }}>
              {course.price ? `₹${course.price}` : 'Free'}
            </span>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleViewFolder} style={btnStyle}>
              <FolderOutlined /> Folder
            </button>
            <button onClick={handleManageUsers} style={{
              ...btnStyle,
              flex: 1.5,
              background: '#7c3aed',
              borderColor: '#7c3aed',
              color: '#fff',
            }}>
              <TeamOutlined /> Users ({enrolled})
            </button>
            <div onClick={(e) => e.stopPropagation()}>
              <CourseActions
                courseId={course._id}
                rootFolderId={course.rootFolder?._id || course.rootFolder}
                isPublished={course.isPublished}
                onTogglePublish={handleTogglePublish}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>

      {userManagerVisible && (
        <Suspense fallback={null}>
          <BatchUserManager
            visible={userManagerVisible}
            onCancel={() => setUserManagerVisible(false)}
            course={course}
            onRefresh={onRefresh}
          />
        </Suspense>
      )}
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
  transition: 'all 0.15s',
};

BatchCourseCard.displayName = 'BatchCourseCard';
export default BatchCourseCard;
