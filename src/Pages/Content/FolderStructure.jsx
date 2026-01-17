import { Dropdown, Menu, message, Button } from "antd";
import React, { useEffect, useState, memo, useCallback } from "react";
import {
  FaEllipsisV,
  FaFolder,
  FaCrown,
  FaArrowRight,
  FaDownload,
  FaBan
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses } from "../../redux/slices/courseSlice";

import "./Content.css";

// Styles
const styles = {
  header: {
    marginBottom: '32px',
  },
  headerTitle: {
    margin: 0,
    fontSize: '28px',
    fontWeight: '700',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  subtitle: {
    margin: '8px 0 0',
    fontSize: '14px',
    color: '#888',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  folderCard: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
    position: 'relative',
  },
  folderIcon: {
    width: '64px',
    height: '64px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '28px',
  },
  folderName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
  },
  folderBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '500',
    marginBottom: '16px',
  },
  actionBtn: {
    position: 'absolute',
    top: '16px',
    right: '16px',
  },
  skeleton: {
    background: '#262626',
    borderRadius: '16px',
    height: '220px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px',
    gridColumn: '1 / -1',
    color: '#666',
  }
};

// Skeleton Component
const FolderSkeleton = memo(() => (
  <div style={styles.skeleton} />
));

// Folder Card Component
const FolderCard = memo(({ folder, isMaster, onClick, onMenuClick }) => {
  const [hovered, setHovered] = useState(false);

  const getDisplay = () => {
    if (isMaster) {
      return {
        icon: <FaCrown style={{ color: '#a855f7' }} />,
        bgColor: 'linear-gradient(135deg, #7c3aed20 0%, #a855f720 100%)',
        borderColor: '#7c3aed40',
        badge: '👑 Master',
        badgeBg: '#7c3aed20',
        badgeColor: '#a855f7',
      };
    }
    return {
      icon: <FaFolder style={{ color: '#3b82f6' }} />,
      bgColor: 'linear-gradient(135deg, #2563eb20 0%, #3b82f620 100%)',
      borderColor: '#3b82f640',
      badge: '📚 Course',
      badgeBg: '#3b82f620',
      badgeColor: '#3b82f6',
    };
  };

  const display = getDisplay();

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<FaDownload />} onClick={() => onMenuClick(folder.rootFolder, true)}>
        Allow Downloads
      </Menu.Item>
      <Menu.Item key="2" icon={<FaBan />} onClick={() => onMenuClick(folder.rootFolder, false)} danger>
        Block Downloads
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        ...styles.folderCard,
        borderColor: hovered ? display.borderColor : '#262626',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      onClick={() => onClick(isMaster ? folder : folder.rootFolder)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!isMaster && (
        <div style={styles.actionBtn}>
          <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
            <Button
              type="text"
              icon={<FaEllipsisV style={{ color: '#888' }} />}
              onClick={e => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      )}

      <div style={{ ...styles.folderIcon, background: display.bgColor }}>
        {display.icon}
      </div>

      <h3 style={styles.folderName}>{isMaster ? 'Master Content Folder' : folder.title}</h3>

      <span style={{
        ...styles.folderBadge,
        background: display.badgeBg,
        color: display.badgeColor,
      }}>
        {display.badge}
      </span>

      <Button
        type="primary"
        size="small"
        icon={<FaArrowRight />}
        style={{ width: '100%', fontWeight: '600', marginTop: '8px' }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(isMaster ? folder : folder.rootFolder);
        }}
      >
        Open Folder
      </Button>
    </div>
  );
});

function FolderComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { courses, loading } = useSelector((state) => state.courses);

  // Master Folder state
  const [masterFolder, setMasterFolder] = useState(null);
  const [masterFolderLoading, setMasterFolderLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchCourses());
    fetchMasterFolder();
  }, [dispatch]);

  const fetchMasterFolder = async () => {
    try {
      setMasterFolderLoading(true);
      const response = await api.get('/admin/master-folder/hierarchy');
      setMasterFolder(response.data.data);
    } catch (error) {
      if (error.response?.status === 404) {
        try {
          await api.post('/admin/master-folder/initialize');
          const retryResponse = await api.get('/admin/master-folder/hierarchy');
          setMasterFolder(retryResponse.data.data);
        } catch (initError) {
          console.error('Error initializing Master Folder:', initError);
        }
      }
    } finally {
      setMasterFolderLoading(false);
    }
  };

  const handleNavigation = useCallback((folderId) => {
    if (!folderId) {
      message.error('Invalid folder ID');
      return;
    }

    const cleanFolderId = typeof folderId === 'object'
      ? folderId._id || folderId.id
      : folderId;

    if (!cleanFolderId) {
      message.error('Invalid folder structure');
      return;
    }

    navigate(`/folder/${cleanFolderId}`);
  }, [navigate]);

  const handleToggleDownload = async (rootFolderId, allowDownload) => {
    try {
      await api.post("/admin/updateDownloads", {
        rootFolderId,
        allowDownload,
      });
      message.success(`Downloads ${allowDownload ? "enabled" : "disabled"} successfully`);
    } catch (error) {
      message.error("Failed to update download settings");
    }
  };

  const isLoading = loading || masterFolderLoading;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          <span>📂</span> Content Management
        </h1>
        <p style={styles.subtitle}>Master Folder & Course Folders</p>
      </div>

      <div style={styles.grid}>
        {isLoading ? (
          [1, 2, 3, 4].map(i => <FolderSkeleton key={i} />)
        ) : (
          <>
            {/* Master Folder */}
            {masterFolder && (
              <FolderCard
                folder={masterFolder._id}
                isMaster={true}
                onClick={handleNavigation}
              />
            )}

            {/* Course Folders */}
            {courses.map((course) => (
              <FolderCard
                key={course._id}
                folder={course}
                isMaster={false}
                onClick={handleNavigation}
                onMenuClick={handleToggleDownload}
              />
            ))}

            {!masterFolder && courses.length === 0 && (
              <div style={styles.emptyState}>
                <FaFolder size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                <p>No folders found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HOC(FolderComponent);
