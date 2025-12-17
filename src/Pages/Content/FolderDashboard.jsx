// ============================================================================
// 🗂️ FOLDER DASHBOARD - Main folder navigation page
// ============================================================================
// 
// This page shows all top-level folders including the Master Content Folder
// Provides navigation entry point to the folder system
//
// ============================================================================

import { Button, Card, Col, message, Modal, Row, Spin } from "antd";
import React, { useEffect, useState } from "react";
import {
  FaArrowRight,
  FaCog,
  FaFolder,
  FaLock,
  FaPlus
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";

const FolderDashboard = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [showInitModal, setShowInitModal] = useState(false);
  const [initializing, setInitializing] = useState(false);

  // Fetch all top-level folders (including Master Folder)
  const fetchTopLevelFolders = async () => {
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
      
      // Combine Master Folder with other top-level folders
      const allFolders = [];
      if (masterFolder) {
        allFolders.push(masterFolder);
      }
      
      // Add other folders that aren't the master folder
      if (foldersResponse.data.success) {
        const otherFolders = foldersResponse.data.data.filter(
          folder => !folder.isMasterFolder
        );
        allFolders.push(...otherFolders);
      }
      
      setFolders(allFolders);
      
    } catch (error) {
      console.error('Error fetching folders:', error);
      
      // If Master Folder doesn't exist, show initialization option
      if (error.response?.status === 404 || 
          error.response?.data?.message?.includes('Master Folder not found')) {
        setShowInitModal(true);
      } else {
        message.error('Failed to load folders: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch folder statistics
  const fetchStatistics = async () => {
    try {
      const response = await api.get('/admin/master-folder/statistics');
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      // Don't show error for statistics as it's not critical
    }
  };

  // Initialize Master Folder System
  const initializeMasterFolder = async () => {
    try {
      setInitializing(true);
      const response = await api.post('/admin/master-folder/initialize');
      
      if (response.data.success) {
        message.success('Master Folder System initialized successfully!');
        setShowInitModal(false);
        // Refresh the folder list
        await fetchTopLevelFolders();
        await fetchStatistics();
      }
    } catch (error) {
      console.error('Error initializing Master Folder:', error);
      message.error('Failed to initialize Master Folder System: ' + 
        (error.response?.data?.message || error.message));
    } finally {
      setInitializing(false);
    }
  };

  useEffect(() => {
    fetchTopLevelFolders();
    fetchStatistics();
  }, []);

  // Navigate to folder contents
  const handleFolderClick = (folderId) => {
    // Ensure we have a valid string ID
    const cleanFolderId = typeof folderId === 'object' ? folderId._id || folderId.id : folderId;
    
    if (!cleanFolderId) {
      console.error('❌ [ERROR] Invalid folder ID in FolderDashboard:', folderId);
      message.error('Invalid folder ID');
      return;
    }

    navigate(`/folder/${cleanFolderId}`);
  };

  // Get folder icon and styling based on type
  const getFolderDisplay = (folder) => {
    if (folder.isMasterFolder) {
      return {
        icon: <div className="text-4xl">👑</div>,
        bgColor: 'bg-gradient-to-br from-purple-100 to-purple-200',
        borderColor: 'border-purple-300',
        textColor: 'text-purple-800',
        badge: '👑 Master',
        badgeColor: 'bg-purple-100 text-purple-800'
      };
    } else if (folder.isSystemFolder) {
      return {
        icon: <FaLock className="text-4xl text-orange-600" />,
        bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
        borderColor: 'border-orange-300',
        textColor: 'text-orange-800',
        badge: '🔒 System',
        badgeColor: 'bg-orange-100 text-orange-800'
      };
    } else {
      return {
        icon: <FaFolder className="text-4xl text-blue-600" />,
        bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-800',
        badge: '📁 Folder',
        badgeColor: 'bg-blue-100 text-blue-800'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <Spin size="large" />
        <span className="ml-3 text-lg">Loading folders...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              📂 Content Management
            </h1>
            <p className="text-gray-600">
              Manage all your content folders, files, and resources
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              type="primary" 
              icon={<FaPlus />}
              onClick={() => navigate('/create-folder')}
            >
              Create Folder
            </Button>
            <Button 
              icon={<FaCog />}
              onClick={() => setShowInitModal(true)}
            >
              Initialize System
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        {statistics && (
          <Row gutter={16} className="mb-6">
            <Col span={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {statistics.total}
                </div>
                <div className="text-gray-600">Total Folders</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {statistics.system}
                </div>
                <div className="text-gray-600">System Folders</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {statistics.deletable}
                </div>
                <div className="text-gray-600">User Folders</div>
              </Card>
            </Col>
            <Col span={6}>
              <Card className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {statistics.protected}
                </div>
                <div className="text-gray-600">Protected</div>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Folders Grid */}
      {folders.length > 0 ? (
        <Row gutter={[24, 24]}>
          {folders.map((folder) => {
            const display = getFolderDisplay(folder);
            const itemCount = (folder.folders?.length || 0) + (folder.files?.length || 0);
            
            return (
              <Col key={folder._id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  className={`${display.bgColor} ${display.borderColor} border-2 transition-all duration-300 hover:shadow-lg hover:scale-105`}
                  onClick={() => handleFolderClick(folder._id)}
                  bodyStyle={{ padding: '24px' }}
                >
                  <div className="text-center">
                    {/* Folder Icon */}
                    <div className="flex justify-center mb-4">
                      {display.icon}
                    </div>
                    
                    {/* Folder Name */}
                    <h3 className={`text-lg font-semibold mb-2 ${display.textColor}`}>
                      {folder.name}
                    </h3>
                    
                    {/* Folder Badge */}
                    <div className="mb-3">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${display.badgeColor}`}>
                        {display.badge}
                      </span>
                    </div>
                    
                    {/* Item Count */}
                    <div className="text-sm text-gray-600 mb-3">
                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                    </div>
                    
                    {/* System Description */}
                    {folder.systemDescription && (
                      <div className="text-xs text-gray-500 mb-4 line-clamp-2">
                        {folder.systemDescription}
                      </div>
                    )}
                    
                    {/* Enter Button */}
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<FaArrowRight />}
                      className="w-full"
                      onClick={(e) => {
                        if (e && typeof e.stopPropagation === 'function') {
                          e.stopPropagation();
                        }
                        handleFolderClick(folder._id);
                      }}
                    >
                      Open Folder
                    </Button>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📂</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No Folders Found
          </h3>
          <p className="text-gray-500 mb-6">
            Initialize the Master Folder System to get started with content management
          </p>
          <Button 
            type="primary" 
            size="large"
            icon={<FaCog />}
            onClick={() => setShowInitModal(true)}
          >
            Initialize Master Folder System
          </Button>
        </div>
      )}

      {/* Master Folder Initialization Modal */}
      <Modal
        title="🗂️ Initialize Master Folder System"
        visible={showInitModal}
        onOk={initializeMasterFolder}
        onCancel={() => setShowInitModal(false)}
        confirmLoading={initializing}
        okText="Initialize"
        cancelText="Cancel"
      >
        <div className="py-4">
          <p className="mb-4">
            The Master Content Folder system provides a permanent, organized structure 
            for managing all your content. It includes:
          </p>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>📁 <strong>Master Content Folder</strong> - Main container (cannot be deleted)</li>
            <li>📚 <strong>Course Materials</strong> - Course-related content</li>
            <li>🗃️ <strong>General Resources</strong> - General documents and files</li>
            <li>📋 <strong>Templates</strong> - Reusable templates</li>
            <li>📦 <strong>Archived Content</strong> - Old content for reference</li>
            <li>📤 <strong>Shared Documents</strong> - Cross-departmental files</li>
          </ul>
          <p className="mt-4 text-sm text-gray-500">
            This will create the folder structure in your database. The operation is safe 
            and won't affect existing content.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default HOC(FolderDashboard);
