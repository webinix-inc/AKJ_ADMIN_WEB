import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Tree, Button, message } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { fetchCourses } from "../../redux/slices/courseSlice";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { getFolderContents } from "../../redux/slices/contentSlice";

// Helper function to check if a file is a video
const isVideoFile = (file) => {
  if (!file) return false;
  
  // Check file type
  if (file.type === 'youtube' || file.fileType === 'youtube') {
    return true;
  }
  
  // Check URL for video extensions
  const url = file.url || file.fileUrl || '';
  const videoExtensions = ['mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'm4v', '3gp'];
  const extension = url.split('.').pop()?.toLowerCase();
  
  if (videoExtensions.includes(extension)) {
    return true;
  }
  
  // Check filename
  const fileName = file.name || '';
  const fileNameExtension = fileName.split('.').pop()?.toLowerCase();
  
  return videoExtensions.includes(fileNameExtension);
};

// Helper function to check if folder contains only videos
const folderContainsOnlyVideos = (folder) => {
  if (!folder) return false;
  
  // Check files
  if (folder.files && folder.files.length > 0) {
    const allFilesAreVideos = folder.files.every(file => isVideoFile(file));
    if (!allFilesAreVideos) return false;
  }
  
  // Recursively check subfolders
  if (folder.folders && folder.folders.length > 0) {
    return folder.folders.every(subfolder => folderContainsOnlyVideos(subfolder));
  }
  
  return true;
};

const ImportModal = React.memo(
  ({ isVisible, onClose, destinationFolderId, id, isLiveVideosFolder = false }) => {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const [folders, setFolders] = useState({});
    const [masterFolder, setMasterFolder] = useState(null);
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const [loading, setLoading] = useState(false);
    const [loadingMasterFolder, setLoadingMasterFolder] = useState(false);
    const navigate = useNavigate();

    const fetchFolderContents = useCallback(async (folderId) => {
      try {
        // 🔧 FIX: Ensure folderId is a valid string
        const cleanFolderId = typeof folderId === 'object' 
          ? folderId._id || folderId.id || folderId 
          : folderId;
          
        if (!cleanFolderId || cleanFolderId === '[object Object]') {
          console.error('❌ [ERROR] Invalid folder ID for fetching contents:', folderId);
          return;
        }

        console.log('🔍 [DEBUG] Fetching folder contents for:', cleanFolderId);
        const response = await api.get(`/folders/${cleanFolderId}`);
        const folderData = response.data.folder;

        console.log('✅ [DEBUG] Folder contents fetched:', folderData);

        setFolders((prevFolders) => ({
          ...prevFolders,
          [cleanFolderId]: {
            ...folderData,
            folders: folderData.folders || [],
            files: folderData.files || [],
            childrenFetched: true,
          },
        }));
      } catch (error) {
        console.error("❌ [ERROR] Failed to fetch folder contents:", error);
        const errorMsg = error.response?.data?.message || error.message || "Failed to fetch folder contents";
        message.error(`Failed to load folder: ${errorMsg}`);
      }
    }, []);

    const fetchMasterFolder = useCallback(async () => {
      try {
        setLoadingMasterFolder(true);
        const response = await api.get('/admin/master-folder/hierarchy', {
          params: { depth: 1, includeFiles: false }
        });
        if (response.data.success && response.data.data) {
          const masterFolderData = response.data.data;
          const masterFolderId = masterFolderData._id;
          
          setMasterFolder(masterFolderData);
          
          // Fetch initial contents of master folder
          if (masterFolderId) {
            await fetchFolderContents(masterFolderId);
          }
        }
      } catch (error) {
        console.error('❌ [ERROR] Failed to fetch Master Folder:', error);
        // Don't show error - Master Folder might not exist yet
      } finally {
        setLoadingMasterFolder(false);
      }
    }, [fetchFolderContents]);

    const fetchAllRootFolders = useCallback(() => {
      if (courses) {
        courses.forEach((course) => {
          const { rootFolder } = course;
          if (rootFolder) {
            // 🔧 FIX: Ensure rootFolder is a valid ID
            const cleanRootFolderId = typeof rootFolder === 'object' 
              ? rootFolder._id || rootFolder.id || rootFolder 
              : rootFolder;
              
            if (cleanRootFolderId && cleanRootFolderId !== '[object Object]') {
              console.log('🔍 [DEBUG] Fetching root folder for course:', course.title, 'ID:', cleanRootFolderId);
              fetchFolderContents(cleanRootFolderId);
            } else {
              console.warn('⚠️ [WARN] Invalid root folder ID for course:', course.title, rootFolder);
            }
          }
        });
      }
    }, [courses, fetchFolderContents]);

    const handleExpand = useCallback(
      (expandedKeysValue, { node }) => {
        console.log('🔍 [DEBUG] Expanding node:', node.key, 'isLeaf:', node.isLeaf);
        setExpandedKeys(expandedKeysValue);
        
        // Only fetch contents for folders (not files) that haven't been fetched yet
        if (!node.isLeaf && !folders[node.key]?.childrenFetched) {
          console.log('📂 [DEBUG] Fetching contents for folder:', node.key);
          fetchFolderContents(node.key);
        }
      },
      [fetchFolderContents, folders]
    );

    const isFileKey = (key) => {
      // Check if this key exists in any folder's files array
      for (const folderId in folders) {
        const folderData = folders[folderId];
        if (folderData && folderData.files) {
          const isFile = folderData.files.some(file => {
            const fileId = file._id || file.id || file;
            return fileId === key;
          });
          if (isFile) return true;
        }
      }
      
      // Check if it's a folder (either in folders object or has child folders/files)
      const folder = folders[key];
      if (folder) {
        return false; // It's a folder
      }
      
      // Check if it's a course root folder
      for (const course of courses) {
        const rootFolder = course.rootFolder;
        const cleanRootFolderId = typeof rootFolder === 'object' 
          ? rootFolder._id || rootFolder.id || rootFolder 
          : rootFolder;
        if (cleanRootFolderId === key) {
          return false; // It's a folder (course root)
        }
      }
      
      // Check if it's the Master Folder
      if (masterFolder) {
        const masterFolderId = masterFolder._id || masterFolder.id || masterFolder;
        if (masterFolderId === key) {
          return false; // It's a folder (Master Folder)
        }
      }
      
      // If we can't determine, assume it's a file
      return true;
    };

    const handleSelect = useCallback((selectedKeysValue, info) => {
      // When checkStrictly is true, selectedKeysValue is an object with checked and halfChecked
      // We only want the checked keys
      const checkedKeys = Array.isArray(selectedKeysValue) 
        ? selectedKeysValue 
        : (selectedKeysValue?.checked || []);
      
      console.log('🔍 [DEBUG] Selection changed:', { 
        checkedKeys, 
        total: checkedKeys.length,
        info: info?.node 
      });
      
      setSelectedKeys(checkedKeys);
    }, []);

    const handleMove = async () => {
      // With checkStrictly={true}, only explicitly selected items should be in selectedKeys
      // Separate files and folders based on their type
      let filesToMove = selectedKeys.filter((key) => isFileKey(key));
      let foldersToMove = selectedKeys.filter((key) => !isFileKey(key));
      
      console.log('🔍 [DEBUG] Import operation - Selected items:', {
        totalSelected: selectedKeys.length,
        filesToMove: filesToMove.length,
        foldersToMove: foldersToMove.length,
        fileIds: filesToMove,
        folderIds: foldersToMove
      });
      
      // Safety check: If only files are selected, ensure no parent folders are included
      // This prevents accidental folder copying when only files were intended
      if (filesToMove.length > 0 && foldersToMove.length > 0) {
        // Find parent folders of selected files
        const parentFoldersOfFiles = new Set();
        for (const fileId of filesToMove) {
          for (const folderId in folders) {
            const folderData = folders[folderId];
            if (folderData?.files) {
              const hasFile = folderData.files.some(file => {
                const id = file._id || file.id || file;
                return id === fileId;
              });
              if (hasFile) {
                parentFoldersOfFiles.add(folderId);
              }
            }
          }
        }
        
        // Remove parent folders that contain selected files (unless explicitly selected as folders)
        // This ensures that selecting a file doesn't copy its parent folder
        foldersToMove = foldersToMove.filter(folderId => {
          // Keep folder only if it's not a parent of any selected file
          // OR if it was explicitly selected (user wants to copy both file and folder)
          const isParentOfSelectedFile = parentFoldersOfFiles.has(folderId);
          if (isParentOfSelectedFile) {
            console.log(`⚠️ [WARN] Folder ${folderId} is parent of selected file(s). Removing from foldersToMove to prevent accidental folder copy.`);
            return false; // Don't copy parent folder when only files were selected
          }
          return true; // Keep explicitly selected folders
        });
      }
      
      // If copying to Live Videos folder, filter to only video files and video-only folders
      if (isLiveVideosFolder) {
        // Filter files to only videos
        filesToMove = filesToMove.filter(fileId => {
          // Find the file in folders data
          for (const folderId in folders) {
            const folderData = folders[folderId];
            if (folderData?.files) {
              const file = folderData.files.find(f => {
                const id = f._id || f.id || f;
                return id === fileId;
              });
              if (file && isVideoFile(file)) {
                return true;
              }
            }
          }
          return false;
        });
        
        // Filter folders to only those containing videos
        foldersToMove = foldersToMove.filter(folderId => {
          const folder = folders[folderId];
          return folder && folderContainsOnlyVideos(folder);
        });
        
        if (filesToMove.length === 0 && foldersToMove.length === 0) {
          message.warning("Please select only video files or folders containing videos");
          return;
        }
      }
      
      console.log('🔍 [DEBUG] Import operation:', { 
        filesToMove, 
        foldersToMove, 
        destinationFolderId,
        totalSelected: selectedKeys.length,
        isLiveVideosFolder
      });
      
      try {
        setLoading(true);
        let successCount = 0;
        
        if (filesToMove.length > 0) {
          console.log('📁 [DEBUG] Importing files:', filesToMove);
          const { data } = await api.post("/files/move", {
            fileIds: filesToMove,
            destinationFolderId,
            // Note: sourceFolderId not needed for import/copy operation
          });
          console.log('✅ [DEBUG] Files imported successfully:', data);
          successCount += filesToMove.length;
        }

        if (foldersToMove.length > 0) {
          console.log('📂 [DEBUG] Importing folders:', foldersToMove);
          const { data } = await api.post("/folders/move", {
            folderIds: foldersToMove,
            destinationFolderId,
          });
          console.log('✅ [DEBUG] Folders imported successfully:', data);
          successCount += foldersToMove.length;
        }
        
        if (successCount > 0) {
          message.success(`Successfully imported ${successCount} item(s) to the destination folder`);
          dispatch(getFolderContents(id));
          onClose();
          // Reset selection after successful import
          setSelectedKeys([]);
        } else {
          message.warning("No items were selected for import");
        }
      } catch (error) {
        console.error("❌ [ERROR] Import operation failed:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to import items";
        message.error(`Import failed: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };

    const renderTreeNodes = useCallback(
      (folderId) => {
        const folderData = folders[folderId];
        if (!folderData) {
          // Return a placeholder for folders that haven't been loaded yet
          return [];
        }

        const { folders: childFolders, files: childFiles } = folderData;
        const nodes = [];

        // Add child folders (always expandable)
        // If Live Videos folder, only show folders that contain videos
        if (childFolders && childFolders.length > 0) {
          childFolders.forEach((folder) => {
            const folderId = folder._id || folder.id || folder;
            // If Live Videos folder, only show folders containing videos
            if (isLiveVideosFolder) {
              const folderData = folders[folderId];
              if (folderData && !folderContainsOnlyVideos(folderData)) {
                return; // Skip folders that don't contain only videos
              }
            }
            nodes.push(
              <Tree.TreeNode
                title={folder.name || `Folder ${folderId}`}
                key={folderId}
                icon={<FolderOpenOutlined />}
                isLeaf={false}
              >
                {renderTreeNodes(folderId)}
              </Tree.TreeNode>
            );
          });
        }

        // Add files (not expandable)
        // If Live Videos folder, only show video files
        if (childFiles && childFiles.length > 0) {
          const filesToShow = isLiveVideosFolder 
            ? childFiles.filter(file => isVideoFile(file))
            : childFiles;
            
          filesToShow.forEach((file) => {
            const fileId = file._id || file.id || file;
            nodes.push(
              <Tree.TreeNode
                title={file.name || `File ${fileId}`}
                key={fileId}
                icon={<FileOutlined />}
                isLeaf={true}
              />
            );
          });
        }

        return nodes;
      },
      [folders, isLiveVideosFolder]
    );

    const treeNodes = useMemo(() => {
      const nodes = [];
      
      // Add Master Folder at the top if it exists
      if (masterFolder) {
        const masterFolderId = masterFolder._id || masterFolder.id || masterFolder;
        nodes.push(
          <Tree.TreeNode
            title={`👑 ${masterFolder.name || 'Master Content Folder'}`}
            key={masterFolderId}
            icon={<FolderOpenOutlined />}
            isLeaf={false}
          >
            {masterFolderId ? renderTreeNodes(masterFolderId) : []}
          </Tree.TreeNode>
        );
      }
      
      // Add course folders
      const courseNodes = courses.map((course) => {
        const rootFolder = course.rootFolder;
        const cleanRootFolderId = typeof rootFolder === 'object' 
          ? rootFolder._id || rootFolder.id || rootFolder 
          : rootFolder;
          
        return (
          <Tree.TreeNode
            title={`📚 ${course.title}`}
            key={cleanRootFolderId || course._id} // Use root folder ID as key so it can be imported
            icon={<FolderOpenOutlined />}
            isLeaf={false}
          >
            {cleanRootFolderId ? renderTreeNodes(cleanRootFolderId) : []}
          </Tree.TreeNode>
        );
      });
      
      return [...nodes, ...courseNodes];
    }, [courses, masterFolder, renderTreeNodes]);

    useEffect(() => {
      if (isVisible) {
        dispatch(fetchCourses());
        fetchMasterFolder();
      }
    }, [isVisible, dispatch, fetchMasterFolder]);

    useEffect(() => {
      if (isVisible && courses.length > 0) {
        fetchAllRootFolders();
      }
    }, [isVisible, courses, fetchAllRootFolders]);

    // Reset state when modal closes
    useEffect(() => {
      if (!isVisible) {
        setSelectedKeys([]);
        setExpandedKeys([]);
        setLoading(false);
      }
    }, [isVisible]);

    return (
      <Modal
        title="Import Content"
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={1000}
        bodyStyle={{
          fontSize: "16px",
          padding: "20px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <p style={{ margin: 0, color: "#666", fontSize: "14px" }}>
            {isLiveVideosFolder 
              ? "Select video files and folders containing videos from Master Content Folder or any course to copy into the Live Videos folder. Only video files (mp4, webm, avi, mkv, mov, etc.) will be copied."
              : "Select files and folders from Master Content Folder or any course to import into the current folder. Items will be copied (not moved) to the destination."
            }
          </p>
        </div>
        
        {(courses.length === 0 && !masterFolder && !loadingMasterFolder) ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#999" }}>
            <p>Loading content...</p>
          </div>
        ) : (
          <Tree
            showIcon
            onExpand={handleExpand}
            expandedKeys={expandedKeys}
            onCheck={handleSelect}
            checkedKeys={selectedKeys}
            checkable
            multiple
            autoExpandParent={false}
            checkStrictly={true}
            defaultExpandAll={false}
            style={{ 
              border: "1px solid #d9d9d9", 
              borderRadius: "6px", 
              padding: "12px",
              maxHeight: "400px",
              overflowY: "auto"
            }}
          >
            {treeNodes}
          </Tree>
        )}
        
        <div style={{ 
          marginTop: "20px", 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center" 
        }}>
          <span style={{ color: "#666", fontSize: "14px" }}>
            {selectedKeys.length > 0 
              ? `${selectedKeys.length} item(s) selected for import`
              : "No items selected"
            }
          </span>
          <Button 
            onClick={handleMove} 
            type="primary"
            disabled={selectedKeys.length === 0 || loading}
            loading={loading}
          >
            {loading ? 'Importing...' : `Import Selected (${selectedKeys.length})`}
          </Button>
        </div>
      </Modal>
    );
  }
);

export default ImportModal;
