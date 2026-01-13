import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Tree, Button, message, Spin } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { fetchCourses } from "../../redux/slices/courseSlice";
import api from "../../api/axios";
import { getFolderContents } from "../../redux/slices/contentSlice";

// Helper function to check if a file is a video
const isVideoFile = (file) => {
  if (!file) return false;

  if (file.type === 'youtube' || file.fileType === 'youtube') return true;

  const url = file.url || file.fileUrl || '';
  const videoExtensions = ['mp4', 'webm', 'avi', 'mkv', 'mov', 'flv', 'wmv', 'm4v', '3gp'];
  const extension = url.split('.').pop()?.toLowerCase();

  if (videoExtensions.includes(extension)) return true;

  const fileName = file.name || '';
  const fileNameExtension = fileName.split('.').pop()?.toLowerCase();

  return videoExtensions.includes(fileNameExtension);
};

// Helper function to check if folder contains only videos
const folderContainsOnlyVideos = (folder) => {
  if (!folder) return false;

  if (folder.files && folder.files.length > 0) {
    const allFilesAreVideos = folder.files.every(file => isVideoFile(file));
    if (!allFilesAreVideos) return false;
  }

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

    const fetchFolderContents = useCallback(async (folderId) => {
      try {
        const cleanFolderId = typeof folderId === 'object'
          ? folderId._id || folderId.id || folderId
          : folderId;

        if (!cleanFolderId || cleanFolderId === '[object Object]') return;

        const response = await api.get(`/folders/${cleanFolderId}`);
        const folderData = response.data.folder;

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
        console.error("Failed to fetch folder contents:", error);
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
          setMasterFolder(masterFolderData);
          if (masterFolderData._id) {
            await fetchFolderContents(masterFolderData._id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch Master Folder:', error);
      } finally {
        setLoadingMasterFolder(false);
      }
    }, [fetchFolderContents]);

    const fetchAllRootFolders = useCallback(() => {
      if (courses) {
        courses.forEach((course) => {
          const { rootFolder } = course;
          if (rootFolder) {
            const cleanRootFolderId = typeof rootFolder === 'object'
              ? rootFolder._id || rootFolder.id || rootFolder
              : rootFolder;

            if (cleanRootFolderId && cleanRootFolderId !== '[object Object]') {
              fetchFolderContents(cleanRootFolderId);
            }
          }
        });
      }
    }, [courses, fetchFolderContents]);

    const handleExpand = useCallback(
      (expandedKeysValue, { node }) => {
        setExpandedKeys(expandedKeysValue);
        if (!node.isLeaf && !folders[node.key]?.childrenFetched) {
          fetchFolderContents(node.key);
        }
      },
      [fetchFolderContents, folders]
    );

    const isFileKey = (key) => {
      for (const folderId in folders) {
        const folderData = folders[folderId];
        if (folderData?.files) {
          if (folderData.files.some(file => (file._id || file.id || file) === key)) return true;
        }
      }
      return folders[key] ? false : true;
    };

    const handleSelect = useCallback((selectedKeysValue) => {
      const checkedKeys = Array.isArray(selectedKeysValue)
        ? selectedKeysValue
        : (selectedKeysValue?.checked || []);
      setSelectedKeys(checkedKeys);
    }, []);

    const handleMove = async () => {
      let filesToMove = selectedKeys.filter((key) => isFileKey(key));
      let foldersToMove = selectedKeys.filter((key) => !isFileKey(key));

      if (filesToMove.length > 0 && foldersToMove.length > 0) {
        const parentFoldersOfFiles = new Set();
        for (const fileId of filesToMove) {
          for (const folderId in folders) {
            const folderData = folders[folderId];
            if (folderData?.files) {
              if (folderData.files.some(file => (file._id || file.id || file) === fileId)) {
                parentFoldersOfFiles.add(folderId);
              }
            }
          }
        }

        foldersToMove = foldersToMove.filter(folderId => !parentFoldersOfFiles.has(folderId));
      }

      if (isLiveVideosFolder) {
        filesToMove = filesToMove.filter(fileId => {
          for (const folderId in folders) {
            const folderData = folders[folderId];
            if (folderData?.files) {
              const file = folderData.files.find(f => (f._id || f.id || f) === fileId);
              if (file && isVideoFile(file)) return true;
            }
          }
          return false;
        });

        foldersToMove = foldersToMove.filter(folderId => {
          const folder = folders[folderId];
          return folder && folderContainsOnlyVideos(folder);
        });

        if (filesToMove.length === 0 && foldersToMove.length === 0) {
          message.warning("Please select only video files or folders containing videos");
          return;
        }
      }

      try {
        setLoading(true);
        let successCount = 0;

        if (filesToMove.length > 0) {
          await api.post("/files/move", {
            fileIds: filesToMove,
            destinationFolderId,
          });
          successCount += filesToMove.length;
        }

        if (foldersToMove.length > 0) {
          await api.post("/folders/move", {
            folderIds: foldersToMove,
            destinationFolderId,
          });
          successCount += foldersToMove.length;
        }

        if (successCount > 0) {
          message.success(`Successfully imported ${successCount} item(s)`);
          dispatch(getFolderContents(id));
          onClose();
          setSelectedKeys([]);
        } else {
          message.warning("No items selected");
        }
      } catch (error) {
        message.error("Import failed");
      } finally {
        setLoading(false);
      }
    };

    const renderTreeNodes = useCallback(
      (folderId) => {
        const folderData = folders[folderId];
        if (!folderData) return [];

        const { folders: childFolders, files: childFiles } = folderData;
        const nodes = [];

        if (childFolders?.length > 0) {
          childFolders.forEach((folder) => {
            const fId = folder._id || folder.id || folder;
            if (isLiveVideosFolder) {
              const data = folders[fId];
              if (data && !folderContainsOnlyVideos(data)) return;
            }
            nodes.push(
              <Tree.TreeNode
                title={<span style={{ color: '#d4d4d4' }}>{folder.name}</span>}
                key={fId}
                icon={<FolderOpenOutlined style={{ color: '#3b82f6' }} />}
                isLeaf={false}
              >
                {renderTreeNodes(fId)}
              </Tree.TreeNode>
            );
          });
        }

        if (childFiles?.length > 0) {
          const filesToShow = isLiveVideosFolder
            ? childFiles.filter(file => isVideoFile(file))
            : childFiles;

          filesToShow.forEach((file) => {
            const fId = file._id || file.id || file;
            nodes.push(
              <Tree.TreeNode
                title={<span style={{ color: '#a3a3a3' }}>{file.name}</span>}
                key={fId}
                icon={<FileOutlined style={{ color: '#888' }} />}
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

      if (masterFolder) {
        const mId = masterFolder._id || masterFolder.id || masterFolder;
        nodes.push(
          <Tree.TreeNode
            title={<span style={{ color: '#d4d4d4', fontWeight: 'bold' }}>👑 {masterFolder.name}</span>}
            key={mId}
            icon={<FolderOpenOutlined style={{ color: '#a855f7' }} />}
            isLeaf={false}
          >
            {mId ? renderTreeNodes(mId) : []}
          </Tree.TreeNode>
        );
      }

      const courseNodes = courses.map((course) => {
        const rId = course.rootFolder?._id || course.rootFolder?.id || course.rootFolder;
        return (
          <Tree.TreeNode
            title={<span style={{ color: '#d4d4d4', fontWeight: 'bold' }}>📚 {course.title}</span>}
            key={rId || course._id}
            icon={<FolderOpenOutlined style={{ color: '#f97316' }} />}
            isLeaf={false}
          >
            {rId ? renderTreeNodes(rId) : []}
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
      if (isVisible && courses.length > 0) fetchAllRootFolders();
    }, [isVisible, courses, fetchAllRootFolders]);

    useEffect(() => {
      if (!isVisible) {
        setSelectedKeys([]);
        setExpandedKeys([]);
        setLoading(false);
      }
    }, [isVisible]);

    return (
      <Modal
        title={<span style={{ color: '#fff' }}>Import Content</span>}
        open={isVisible}
        onCancel={onClose}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <div style={{ marginBottom: "20px", color: "#888" }}>
          {isLiveVideosFolder
            ? "Select videos to copy to Live Videos folder."
            : "Select content to import. Items will be copied to this folder."
          }
        </div>

        <div style={{
          background: '#171717',
          border: '1px solid #262626',
          borderRadius: '8px',
          padding: '16px',
          minHeight: '300px',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {(courses.length === 0 && !masterFolder && !loadingMasterFolder) ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <Spin />
              <p style={{ marginTop: '16px', color: '#666' }}>Loading content structure...</p>
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
              checkStrictly={true}
              style={{ background: 'transparent', color: '#fff' }}
              className="dark-tree"
            >
              {treeNodes}
            </Tree>
          )}
        </div>

        <div style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span style={{ color: "#888" }}>
            {selectedKeys.length > 0
              ? `${selectedKeys.length} items selected`
              : "No items selected"
            }
          </span>
          <Button
            onClick={handleMove}
            type="primary"
            disabled={selectedKeys.length === 0 || loading}
            loading={loading}
          >
            {loading ? 'Importing...' : 'Import Selected'}
          </Button>
        </div>

        <style>{`
          .dark-tree .ant-tree-node-content-wrapper:hover {
            background-color: #262626 !important;
          }
          .dark-tree .ant-tree-node-selected .ant-tree-node-content-wrapper {
            background-color: #1e3a5f !important;
          }
          .dark-tree .ant-tree-checkbox-inner {
            background-color: #262626;
            border-color: #404040;
          }
          .dark-tree .ant-tree-checkbox-checked .ant-tree-checkbox-inner {
            background-color: #3b82f6;
            border-color: #3b82f6;
          }
        `}</style>
      </Modal>
    );
  }
);

export default ImportModal;
