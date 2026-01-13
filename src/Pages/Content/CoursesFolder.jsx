import { Button, Input, Modal, Spin } from "antd";
import React, { useEffect, useState, memo, useCallback } from "react";
import { FaEdit, FaFolder, FaSave, FaCrown, FaArrowLeft } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses, updateCourse } from "../../redux/slices/courseSlice";
import "./Content.css";

// Styles
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
  },
  subtitle: {
    margin: '4px 0 0',
    fontSize: '14px',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '20px',
  },
  folderCard: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  folderIcon: {
    marginBottom: '12px',
  },
  folderName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    wordBreak: 'break-word',
  },
  skeleton: {
    background: '#262626',
    borderRadius: '16px',
    height: '150px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '48px',
    color: '#888',
  },
};

// Folder Card Component
const FolderCard = memo(({ folder, isEditing, editName, onEditChange, onSave, onEditClick, onClick, isMaster }) => {
  const [hovered, setHovered] = useState(false);

  const bgColor = isMaster ? '#7c3aed' : '#3b82f6';
  const borderColor = isMaster ? '#7c3aed40' : '#3b82f640';

  return (
    <div
      style={{
        ...styles.folderCard,
        borderColor: hovered ? borderColor : '#262626',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.folderIcon}>
        {isMaster ? (
          <FaCrown size={48} style={{ color: '#a855f7' }} />
        ) : (
          <FaFolder size={48} style={{ color: bgColor }} />
        )}
      </div>

      {isEditing ? (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
          <Input
            value={editName}
            onChange={(e) => onEditChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            size="small"
            style={{ width: '70%' }}
          />
          <Button
            type="primary"
            size="small"
            icon={<FaSave />}
            onClick={onSave}
          />
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span style={styles.folderName}>
            {isMaster ? '📁 Master Content' : folder.title || folder.name}
          </span>
          {!isMaster && (
            <FaEdit
              style={{ color: '#888', cursor: 'pointer', fontSize: '14px' }}
              onClick={(e) => {
                e.stopPropagation();
                onEditClick(folder);
              }}
            />
          )}
        </div>
      )}
    </div>
  );
});

// Skeleton Component
const FolderSkeleton = memo(() => (
  <div style={styles.skeleton} />
));

const CoursesFolder = () => {
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => state.courses);
  const [modalVisible, setModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [updatedCourseName, setUpdatedCourseName] = useState("");
  const [masterFolder, setMasterFolder] = useState(null);
  const [masterFolderLoading, setMasterFolderLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch Master Folder
  const fetchMasterFolder = useCallback(async () => {
    try {
      setMasterFolderLoading(true);
      const response = await api.get('/admin/master-folder/hierarchy');

      if (response.data.success) {
        setMasterFolder(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching Master Folder:', error);

      if (error.response?.status === 404) {
        try {
          await api.post('/admin/master-folder/initialize');
          const retryResponse = await api.get('/admin/master-folder/hierarchy');
          if (retryResponse.data.success) {
            setMasterFolder(retryResponse.data.data);
          }
        } catch (initError) {
          console.error('Error initializing Master Folder:', initError);
        }
      }
    } finally {
      setMasterFolderLoading(false);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchMasterFolder();
  }, [dispatch, fetchMasterFolder]);

  const handleFolderClick = useCallback((courseId) => {
    if (!editingCourseId) navigate(`/content/subjects/${courseId}`);
  }, [navigate, editingCourseId]);

  const handleMasterFolderClick = useCallback(() => {
    if (masterFolder?._id) {
      const cleanFolderId = typeof masterFolder._id === 'object'
        ? masterFolder._id._id || masterFolder._id.id
        : masterFolder._id;
      if (cleanFolderId) {
        navigate(`/folder/${cleanFolderId}`);
      }
    }
  }, [masterFolder, navigate]);

  const handleEditClick = useCallback((course) => {
    setEditingCourseId(course._id);
    setUpdatedCourseName(course.title);
  }, []);

  const handleSaveEdit = useCallback(async (courseId) => {
    try {
      await dispatch(
        updateCourse({
          id: courseId,
          updatedData: { title: updatedCourseName },
        })
      ).unwrap();
      toast.success("Course updated successfully");
      setEditingCourseId(null);
      dispatch(fetchCourses());
    } catch (error) {
      toast.error("Failed to update course");
    }
  }, [dispatch, updatedCourseName]);

  const handleAddFolder = useCallback(() => {
    console.log("Adding new folder:", newFolderName);
    setModalVisible(false);
    setNewFolderName("");
  }, [newFolderName]);

  const isLoading = loading || masterFolderLoading;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>📂 Content Management</h2>
          <p style={styles.subtitle}>Master Folder & Course Folders</p>
        </div>
      </div>

      {/* Modal for Adding New Folder */}
      <Modal
        title={<span style={{ color: '#fff' }}>Add New Folder</span>}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddFolder}>
            Add Folder
          </Button>,
        ]}
      >
        <Input
          placeholder="Enter folder name"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
        />
      </Modal>

      {/* Folder Grid */}
      <div style={styles.grid}>
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map(i => <FolderSkeleton key={i} />)}
          </>
        ) : (
          <>
            {/* Master Folder */}
            {masterFolder && (
              <FolderCard
                folder={masterFolder}
                isMaster={true}
                onClick={handleMasterFolderClick}
              />
            )}

            {/* Course Folders */}
            {error ? (
              <div style={styles.emptyState}>
                <span style={{ color: '#ef4444' }}>{error}</span>
              </div>
            ) : courses.length > 0 ? (
              courses.map((course) => (
                <FolderCard
                  key={course._id}
                  folder={course}
                  isMaster={false}
                  isEditing={editingCourseId === course._id}
                  editName={updatedCourseName}
                  onEditChange={setUpdatedCourseName}
                  onSave={() => handleSaveEdit(course._id)}
                  onEditClick={handleEditClick}
                  onClick={() => handleFolderClick(course._id)}
                />
              ))
            ) : (
              <div style={styles.emptyState}>No courses available</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default HOC(CoursesFolder);
