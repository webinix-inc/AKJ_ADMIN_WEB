import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Modal, Tree, Button, message } from "antd";
import { FolderOpenOutlined, FileOutlined } from "@ant-design/icons";
import { fetchCourses } from "../../redux/slices/courseSlice";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { getFolderContents } from "../../redux/slices/contentSlice";

const ImportModal = React.memo(
  ({ isVisible, onClose, destinationFolderId, id }) => {
    const dispatch = useDispatch();
    const { courses } = useSelector((state) => state.courses);
    const [folders, setFolders] = useState({});
    const [expandedKeys, setExpandedKeys] = useState([]);
    const [selectedKeys, setSelectedKeys] = useState([]);
    const navigate = useNavigate();

    const fetchFolderContents = useCallback(async (folderId) => {
      try {
        const response = await api.get(`/folders/${folderId}`);
        const folderData = response.data.folder;

        setFolders((prevFolders) => ({
          ...prevFolders,
          [folderId]: {
            ...folderData,
            folders: folderData.folders || [],
            files: folderData.files || [],
          },
        }));
      } catch (error) {
        console.error("Error fetching folder contents:", error);
        message.error("Failed to fetch folder contents.");
      }
    }, []);

    const fetchAllRootFolders = useCallback(() => {
      if (courses) {
        courses.forEach((course) => {
          const { rootFolder } = course;
          if (rootFolder) {
            fetchFolderContents(rootFolder);
          }
        });
      }
    }, [courses, fetchFolderContents]);

    const handleExpand = useCallback(
      (expandedKeysValue, { node }) => {
        setExpandedKeys(expandedKeysValue);
        if (!node.isLeaf && !folders[node.key]?.childrenFetched) {
          fetchFolderContents(node.key);
          setFolders((prevFolders) => ({
            ...prevFolders,
            [node.key]: {
              ...prevFolders[node.key],
              childrenFetched: true,
            },
          }));
        }
      },
      [fetchFolderContents, folders]
    );

    const isFileKey = (key) => {
      const folder = folders[key];
      return !(folder && (folder.folders || []).length > 0);
    };

    const handleSelect = useCallback((selectedKeysValue) => {
      setSelectedKeys(selectedKeysValue);
    }, []);

    const handleMove = async () => {
      const filesToMove = selectedKeys.filter((key) => isFileKey(key));
      const foldersToMove = selectedKeys;
      try {
        if (filesToMove.length > 0) {
          const { data } = await api.post("/files/move", {
            fileIds: filesToMove,
            destinationFolderId,
          });
          message.success(data.message);
        }

        if (foldersToMove.length > 0) {
          const { data } = await api.post("/folders/move", {
            folderIds: foldersToMove,
            destinationFolderId,
          });
          message.success(data.message);
        }
        dispatch(getFolderContents(id));
        onClose();
      } catch (error) {
        console.error("Error moving items:", error);
        message.error("Failed to move items.");
      }
    };

    const renderTreeNodes = useCallback(
      (folderId) => {
        const folderData = folders[folderId];
        if (!folderData) return null;

        const { folders: childFolders, files: childFiles } = folderData;

        return [
          ...(childFolders || []).map((folder) => (
            <Tree.TreeNode
              title={folder.name}
              key={folder._id}
              icon={<FolderOpenOutlined />}
              isLeaf={false}
            >
              {renderTreeNodes(folder._id)}
            </Tree.TreeNode>
          )),
          ...(childFiles || []).map((file) => (
            <Tree.TreeNode
              title={file.name}
              key={file._id}
              icon={<FileOutlined />}
              isLeaf={true}
            />
          )),
        ];
      },
      [folders]
    );

    const treeNodes = useMemo(() => {
      return courses.map((course) => {
        const rootFolderId = course.rootFolder;
        return (
          <Tree.TreeNode
            title={course.title}
            key={course._id}
            icon={<FolderOpenOutlined />}
          >
            {renderTreeNodes(rootFolderId)}
          </Tree.TreeNode>
        );
      });
    }, [courses, renderTreeNodes]);

    useEffect(() => {
      if (isVisible) {
        dispatch(fetchCourses());
      }
    }, [isVisible, dispatch]);

    useEffect(() => {
      if (isVisible && courses.length > 0) {
        fetchAllRootFolders();
      }
    }, [isVisible, courses, fetchAllRootFolders]);

    return (
      <Modal
        title="Import Content"
        visible={isVisible}
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
        <Tree
          showIcon
          onExpand={handleExpand}
          expandedKeys={expandedKeys}
          onCheck={handleSelect}
          selectedKeys={selectedKeys}
          checkable
          multiple
          autoExpandParent
        >
          {treeNodes}
        </Tree>
        <Button onClick={handleMove} style={{ marginTop: "20px" }}>
          Move Selected
        </Button>
      </Modal>
    );
  }
);

export default ImportModal;
