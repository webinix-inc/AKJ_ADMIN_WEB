// ============================================================================
// 🗂️ FOLDER DASHBOARD - Main folder navigation page
// ============================================================================
// 
// This page shows all top-level folders including the Master Content Folder
// Provides navigation entry point to the folder system
//
// ============================================================================

import { Button, Modal, Spin } from "antd";
import React, { useEffect, useState, memo, useCallback, Suspense } from "react";
import {
  FaArrowRight,
  FaCog,
  FaFolder,
  FaLock,
  FaPlus,
  FaCrown,
  FaBoxOpen
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";

import "./Content.css";

// Styles
const styles = {
  header: {
    marginBottom: '32px',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
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
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '32px',
  },
  statCard: {
    background: '#171717',
    borderRadius: '12px',
    border: '1px solid #262626',
    padding: '20px',
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
  },
  foldersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  folderCard: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    padding: '24px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center',
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
    marginBottom: '12px',
  },
  itemCount: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '64px 24px',
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px',
  },
  skeleton: {
    background: '#262626',
    borderRadius: '16px',
    height: '200px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
};

// Skeleton component for loading state
const FolderSkeleton = memo(() => (
  <div style={styles.skeleton} />
));

// Folder Card component
const FolderCard = memo(({ folder, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const getDisplay = () => {
    if (folder.isMasterFolder) {
      return {
        icon: <FaCrown style={{ color: '#a855f7' }} />,
        bgColor: 'linear-gradient(135deg, #7c3aed20 0%, #a855f720 100%)',
        borderColor: '#7c3aed40',
        badge: '👑 Master',
        badgeBg: '#7c3aed20',
        badgeColor: '#a855f7',
      };
    } else if (folder.isSystemFolder) {
      return {
        icon: <FaLock style={{ color: '#f97316' }} />,
        bgColor: 'linear-gradient(135deg, #ea580c20 0%, #f9731620 100%)',
        borderColor: '#f9731640',
        badge: '🔒 System',
        badgeBg: '#f9731620',
        badgeColor: '#f97316',
      };
    }
    return {
      icon: <FaFolder style={{ color: '#3b82f6' }} />,
      bgColor: 'linear-gradient(135deg, #2563eb20 0%, #3b82f620 100%)',
      borderColor: '#3b82f640',
      badge: '📁 Folder',
      badgeBg: '#3b82f620',
      badgeColor: '#3b82f6',
    };
  };

  const display = getDisplay();
  const itemCount = (folder.folders?.length || 0) + (folder.files?.length || 0);

  return (
    <div
      style={{
        ...styles.folderCard,
        borderColor: hovered ? display.borderColor : '#262626',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 12px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      onClick={() => onClick(folder._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ ...styles.folderIcon, background: display.bgColor }}>
        {display.icon}
      </div>

      <h3 style={styles.folderName}>{folder.name}</h3>

      <span style={{
        ...styles.folderBadge,
        background: display.badgeBg,
        color: display.badgeColor,
      }}>
        {display.badge}
      </span>

      <div style={styles.itemCount}>
        {itemCount} {itemCount === 1 ? 'item' : 'items'}
      </div>

      {folder.systemDescription && (
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '16px', lineHeight: 1.4 }}>
          {folder.systemDescription.slice(0, 60)}...
        </p>
      )}

      <Button
        type="primary"
        size="small"
        icon={<FaArrowRight />}
        style={{ width: '100%', fontWeight: '600' }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(folder._id);
        }}
      >
        Open Folder
      </Button>
    </div>
  );
});

// Stat Card component
const StatCard = memo(({ value, label, color }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statNumber, color }}>{value}</div>
    <div style={styles.statLabel}>{label}</div>
  </div>
));

const FolderDashboard = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Fetch all top-level folders (including Master Folder)
  const fetchTopLevelFolders = useCallback(async () => {
    try {
      setLoading(true);

      const [masterResponse, foldersResponse] = await Promise.all([
        api.get('/admin/master-folder/hierarchy', {
          params: { depth: 1, includeFiles: false }
        }),
        api.get('/admin/folders', {
          params: { parentFolderId: null, excludeMaster: false }
        })
      ]);

      const masterFolder = masterResponse.data.data;
      const allFolders = [];

      if (masterFolder) {
        allFolders.push(masterFolder);
      }

      if (foldersResponse.data.success) {
        const otherFolders = foldersResponse.data.data.filter(
          folder => !folder.isMasterFolder
        );
        allFolders.push(...otherFolders);
      }

      setFolders(allFolders);

    } catch (error) {
      console.error('Error fetching folders:', error);
      if (error.response?.status === 404 ||
        error.response?.data?.message?.includes('Master Folder not found')) {
        setShowInitModal(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch folder statistics
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await api.get('/admin/master-folder/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  }, []);

  // Initialize Master Folder System
  const initializeMasterFolder = useCallback(async () => {
    try {
      setInitializing(true);
      const response = await api.post('/admin/master-folder/initialize');

      if (response.data.success) {
        setShowInitModal(false);
        await fetchTopLevelFolders();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error initializing Master Folder:', error);
    } finally {
      setInitializing(false);
    }
  }, [fetchTopLevelFolders, fetchStatistics]);

  useEffect(() => {
    fetchTopLevelFolders();
    fetchStatistics();
  }, [fetchTopLevelFolders, fetchStatistics]);

  // Navigate to folder contents
  const handleFolderClick = useCallback((folderId) => {
    const cleanFolderId = typeof folderId === 'object' ? folderId._id || folderId.id : folderId;
    if (!cleanFolderId) return;
    navigate(`/folder/${cleanFolderId}`);
  }, [navigate]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <div style={styles.skeleton} />
        </div>
        <div style={styles.foldersGrid}>
          {[1, 2, 3, 4].map(i => <FolderSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTop}>
          <div>
            <h1 style={styles.title}>
              <span>📂</span> Content Management
            </h1>
            <p style={styles.subtitle}>
              Manage all your content folders, files, and resources
            </p>
          </div>
          <div style={styles.buttonGroup}>
            <Button
              type="primary"
              icon={<FaPlus />}
              onClick={() => navigate('/create-folder')}
              style={{ fontWeight: '600' }}
            >
              Create Folder
            </Button>
            <Button
              icon={<FaCog />}
              onClick={() => setShowInitModal(true)}
            >
              Initialize
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <div style={styles.statsGrid}>
            <StatCard value={statistics.total} label="Total Folders" color="#3b82f6" />
            <StatCard value={statistics.system} label="System Folders" color="#a855f7" />
            <StatCard value={statistics.deletable} label="User Folders" color="#22c55e" />
            <StatCard value={statistics.protected} label="Protected" color="#f97316" />
          </div>
        )}
      </div>

      {/* Folders Grid */}
      {folders.length > 0 ? (
        <div style={styles.foldersGrid}>
          {folders.map((folder) => (
            <FolderCard
              key={folder._id}
              folder={folder}
              onClick={handleFolderClick}
            />
          ))}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}><FaBoxOpen color="#888" /></div>
          <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Folders Found</h3>
          <p style={{ color: '#888', marginBottom: '24px' }}>
            Initialize the Master Folder System to get started
          </p>
          <Button
            type="primary"
            size="large"
            icon={<FaCog />}
            onClick={() => setShowInitModal(true)}
          >
            Initialize Master Folder
          </Button>
        </div>
      )}

      {/* Master Folder Initialization Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>🗂️ Initialize Master Folder System</span>}
        open={showInitModal}
        onOk={initializeMasterFolder}
        onCancel={() => setShowInitModal(false)}
        confirmLoading={initializing}
        okText="Initialize"
        cancelText="Cancel"
      >
        <div style={{ padding: '16px 0' }}>
          <p style={{ marginBottom: '16px', color: '#d4d4d4' }}>
            The Master Content Folder system provides a permanent, organized structure
            for managing all your content:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#a3a3a3', lineHeight: 2 }}>
            <li>📁 <strong>Master Content Folder</strong> - Main container</li>
            <li>📚 <strong>Course Materials</strong> - Course-related content</li>
            <li>🗃️ <strong>General Resources</strong> - General documents</li>
            <li>📋 <strong>Templates</strong> - Reusable templates</li>
            <li>📦 <strong>Archived Content</strong> - Old content</li>
            <li>📤 <strong>Shared Documents</strong> - Cross-departmental files</li>
          </ul>
        </div>
      </Modal>
    </div>
  );
};

export default HOC(FolderDashboard);
