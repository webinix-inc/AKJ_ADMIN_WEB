// ✅ React & Core
import React, { useCallback, useEffect, useMemo, useState } from "react";

// ✅ Redux & Routing
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// ✅ Ant Design
import { InboxOutlined } from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Dropdown,
  Input,
  Menu,
  Modal,
  Spin,
  Switch,
  Upload,
  message
} from "antd";
import TextArea from "antd/es/input/TextArea";

// ✅ React Bootstrap (Removed)
// import { Button } from "react-bootstrap";

// ✅ Icons
import {
  FaArrowLeft,
  FaEllipsisV,
  FaFile,
  FaFileAlt,
  FaFileArchive,
  FaFileCode,
  FaFileExcel,
  FaFileImage,
  FaFileImport,
  FaFilePdf,
  FaFilePowerpoint,
  FaFileVideo,
  FaFileWord,
  FaFolder,
  FaList,
  FaLock,
  FaPlay,
  FaPlus,
  FaTh,
  FaUnlock,
  FaVideo
} from "react-icons/fa";



import { AiOutlineFile } from "react-icons/ai";

// ✅ Drag & Drop
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

// ✅ Custom Components & APIs
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import ImportModal from "./ImportModal";

import {
  addSubfolder,
  deleteFileFromFolder,
  deleteFolder,
  getFolderContents,
  updateFileInFolder,
  updateFileOrder,
  updateFolder
} from "../../redux/slices/contentSlice";

// ✅ Dark Theme Styles
import "./Content.css";

const { Dragger } = Upload;

// Safe selector that handles undefined state
const selectFolderById = (state, folderId) => {
  if (!state || !state.content) {
    return null;
  }
  const folders = state.content.folders;
  if (!folders || !folderId) {
    return null;
  }
  return folders[folderId] || null;
};

// ✅ Custom Style Injection
const customStyles = `
  .line-clamp-1 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
  }
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
`;

if (typeof document !== "undefined" && !document.getElementById("custom-file-styles")) {
  const style = document.createElement("style");
  style.id = "custom-file-styles";
  style.textContent = customStyles;
  document.head.appendChild(style);
}


// Helper function to get file icon and color based on file type
const getFileIcon = (fileName, fileUrl, fileType) => {
  // Check if it's a YouTube free class
  if (fileType === 'youtube' || (fileUrl && (fileUrl.includes('youtube.com') || fileUrl.includes('youtu.be')))) {
    return { icon: FaVideo, color: '#ff0000', bgColor: '#ffe0e0' }; // YouTube red
  }

  const extension = fileName?.split('.').pop()?.toLowerCase() || fileUrl?.split('.').pop()?.toLowerCase() || '';

  const iconConfig = {
    // Video files
    mp4: { icon: FaFileVideo, color: '#ff6b6b', bgColor: '#ffe0e0' },
    avi: { icon: FaFileVideo, color: '#ff6b6b', bgColor: '#ffe0e0' },
    mkv: { icon: FaFileVideo, color: '#ff6b6b', bgColor: '#ffe0e0' },
    mov: { icon: FaFileVideo, color: '#ff6b6b', bgColor: '#ffe0e0' },
    webm: { icon: FaFileVideo, color: '#ff6b6b', bgColor: '#ffe0e0' },

    // PDF files
    pdf: { icon: FaFilePdf, color: '#e74c3c', bgColor: '#fdf2f2' },

    // Image files
    jpg: { icon: FaFileImage, color: '#3498db', bgColor: '#e8f4fd' },
    jpeg: { icon: FaFileImage, color: '#3498db', bgColor: '#e8f4fd' },
    png: { icon: FaFileImage, color: '#3498db', bgColor: '#e8f4fd' },
    gif: { icon: FaFileImage, color: '#3498db', bgColor: '#e8f4fd' },
    svg: { icon: FaFileImage, color: '#3498db', bgColor: '#e8f4fd' },

    // Document files
    doc: { icon: FaFileWord, color: '#2980b9', bgColor: '#e8f1f8' },
    docx: { icon: FaFileWord, color: '#2980b9', bgColor: '#e8f1f8' },
    txt: { icon: FaFileAlt, color: '#7f8c8d', bgColor: '#f8f9fa' },

    // Spreadsheet files
    xls: { icon: FaFileExcel, color: '#27ae60', bgColor: '#e8f5e8' },
    xlsx: { icon: FaFileExcel, color: '#27ae60', bgColor: '#e8f5e8' },

    // Presentation files
    ppt: { icon: FaFilePowerpoint, color: '#e67e22', bgColor: '#fef4e8' },
    pptx: { icon: FaFilePowerpoint, color: '#e67e22', bgColor: '#fef4e8' },

    // Archive files
    zip: { icon: FaFileArchive, color: '#8e44ad', bgColor: '#f4e8f7' },
    rar: { icon: FaFileArchive, color: '#8e44ad', bgColor: '#f4e8f7' },
    '7z': { icon: FaFileArchive, color: '#8e44ad', bgColor: '#f4e8f7' },

    // Code files
    js: { icon: FaFileCode, color: '#f39c12', bgColor: '#fef9e8' },
    jsx: { icon: FaFileCode, color: '#f39c12', bgColor: '#fef9e8' },
    html: { icon: FaFileCode, color: '#f39c12', bgColor: '#fef9e8' },
    css: { icon: FaFileCode, color: '#f39c12', bgColor: '#fef9e8' },
    json: { icon: FaFileCode, color: '#f39c12', bgColor: '#fef9e8' }
  };

  return iconConfig[extension] || { icon: FaFile, color: '#95a5a6', bgColor: '#f8f9fa' };
};

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

// Helper function to check if folder is Live Videos folder
const isLiveVideosFolder = (folder) => {
  if (!folder) return false;
  return folder.name === '🎥 Live Videos' || folder.name === 'Live Videos';
};

// Helper function to filter video files only
const filterVideoFiles = (files) => {
  if (!files || !Array.isArray(files)) return [];
  return files.filter(file => isVideoFile(file));
};

// Helper function to check if folder contains only videos (for copy operation)
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

const FolderContents = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const folder = useSelector(
    (state) => selectFolderById(state, folderId),
    shallowEqual
  );

  // Check if current folder is Live Videos folder
  const isLiveVideos = useMemo(() => isLiveVideosFolder(folder), [folder]);

  // Filter files to show only videos if in Live Videos folder
  const displayFiles = useMemo(() => {
    if (!folder?.files) return [];
    return isLiveVideos ? filterVideoFiles(folder.files) : folder.files;
  }, [folder?.files, isLiveVideos]);
  const folderLoading = useSelector(
    (state) => state.content?.loadingByFolder?.[folderId] || false
  );
  const error = useSelector((state) => state.content?.error || null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isUploadNotesModalVisible, setIsUploadNotesModalVisible] =
    useState(false);
  const [videoFiles, setVideoFiles] = useState([]);
  const [noteFiles, setNoteFiles] = useState([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // 'gallery' or 'list'
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [newName, setNewName] = useState("");
  const [isEditFileModalVisible, setIsEditFileModalVisible] = useState(false);
  const [isEditFolderModalVisible, setIsEditFolderModalVisible] =
    useState(false);
  const [editingFile, setEditingFile] = useState({
    fileId: "",
    name: "",
    url: "",
    description: "",
    isDownloadable: false,
    isViewable: false,
  });
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [previewContent, setPreviewContent] = useState(null);
  const [securePreviewUrl, setSecurePreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [notesTitle, setNotesTitle] = useState("");
  const [notesDescription, setNotesDescription] = useState("");
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [renamingFile, setRenamingFile] = useState({
    fileId: "",
    name: "",
  });
  const [isRenameFileModalVisible, setRenameFileModalVisible] = useState(false);

  // Free Class states
  const [isFreeClassModalVisible, setIsFreeClassModalVisible] = useState(false);
  const [freeClassName, setFreeClassName] = useState("");
  const [freeClassUrl, setFreeClassUrl] = useState("");
  const [freeClassDescription, setFreeClassDescription] = useState("");
  const [freeClassLoading, setFreeClassLoading] = useState(false);

  const handleDragEnd = async (result) => {
    const { destination, source } = result;

    // If dropped outside or no destination, do nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    // Reorder files in the state (use displayFiles for Live Videos folder)
    const filesToReorder = isLiveVideos ? displayFiles : (folder.files || []);
    const updatedFiles = Array.from(filesToReorder);
    const [movedFile] = updatedFiles.splice(source.index, 1);
    updatedFiles.splice(destination.index, 0, movedFile);

    // Update the Redux state temporarily for instant UI feedback
    dispatch(
      updateFolder({
        id: folderId,
        folderData: { ...folder, files: updatedFiles },
      })
    );

    // Persist the new order to the backend
    try {
      await dispatch(
        updateFileOrder({
          folderId,
          fileIds: updatedFiles.map((file) => file._id),
        })
      ).unwrap();
      message.success("File order updated successfully");
    } catch (error) {
      message.error("Failed to update file order: " + error.message);
    }
  };

  const handlePreview = useCallback(async (file) => {
    // Handle YouTube free classes - open in new tab
    if (file.type === 'youtube' || (file.url && (file.url.includes('youtube.com') || file.url.includes('youtu.be')))) {
      window.open(file.url, '_blank');
      return;
    }

    setPreviewContent(file);
    setIsPreviewModalVisible(true);
    setLoadingPreview(true);
    setPreviewError(null);
    setSecurePreviewUrl(null);

    try {
      // Check if it's a file that needs secure streaming
      const fileExtension = file.url.split('.').pop().toLowerCase();
      const isVideoFile = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(fileExtension);
      const isPdfFile = fileExtension === 'pdf';
      const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);

      if (isVideoFile || isPdfFile) {
        // Generate secure token for video and PDF files
        const response = await api.post("/stream/generate-token", {
          fileId: file._id,
        });

        // Check if we got a direct signed URL or streaming token
        if (response.data.isDirectUrl && response.data.signedUrl) {
          // Use the signed URL directly for videos and PDFs
          setSecurePreviewUrl(response.data.signedUrl);
        } else {
          // Use streaming token URL for other cases
          const secureUrl = `${api.defaults.baseURL}/stream/${response.data.token}`;
          setSecurePreviewUrl(secureUrl);
        }
      } else if (isImageFile) {
        // For image files, try to get secure token first, fallback to direct URL
        try {
          const response = await api.post("/stream/generate-token", {
            fileId: file._id,
          });

          if (response.data.isDirectUrl && response.data.signedUrl) {
            setSecurePreviewUrl(response.data.signedUrl);
          } else {
            const secureUrl = `${api.defaults.baseURL}/stream/${response.data.token}`;
            setSecurePreviewUrl(secureUrl);
          }
        } catch (tokenError) {
          console.warn("Token generation failed for image, using direct URL:", tokenError);
          setSecurePreviewUrl(file.url);
        }
      } else {
        // For other files, use direct URL
        setSecurePreviewUrl(file.url);
      }
    } catch (error) {
      console.error("Error generating preview URL:", error);
      setPreviewError("Failed to load file preview. Please try again.");
      message.error("Failed to load file preview");
    } finally {
      setLoadingPreview(false);
    }
  }, []);

  const toggleImportModal = useCallback(() => {
    setIsImportModalVisible((prev) => !prev);
  }, []);

  // Free Class functions
  const showFreeClassModal = () => {
    setIsFreeClassModalVisible(true);
  };

  const handleFreeClassCancel = () => {
    setIsFreeClassModalVisible(false);
    setFreeClassName("");
    setFreeClassUrl("");
    setFreeClassDescription("");
  };

  const handleAddFreeClass = async () => {
    if (!freeClassName.trim() || !freeClassUrl.trim()) {
      message.error("Please provide both class name and YouTube URL");
      return;
    }

    // Validate YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (!youtubeRegex.test(freeClassUrl)) {
      message.error("Please provide a valid YouTube URL");
      return;
    }

    setFreeClassLoading(true);
    try {
      const response = await api.post(`/admin/folders/${folderId}/free-class`, {
        name: freeClassName,
        url: freeClassUrl,
        description: freeClassDescription,
        type: "youtube"
      });

      if (response.status === 200 || response.status === 201) {
        message.success("Free class added successfully");
        setIsFreeClassModalVisible(false);
        setFreeClassName("");
        setFreeClassUrl("");
        setFreeClassDescription("");
        // Refresh folder contents to show the new free class
        dispatch(getFolderContents(folderId));
      } else {
        console.error('❌ [DEBUG] Unexpected response status:', response.status);
        message.error("Failed to add free class");
      }
    } catch (error) {
      console.error("Error adding free class:", error);
      message.error("Error adding free class: " + (error.response?.data?.message || error.message));
    } finally {
      setFreeClassLoading(false);
    }
  };

  const closePreviewModal = useCallback(() => {
    setPreviewContent(null);
    setIsPreviewModalVisible(false);
    setSecurePreviewUrl(null);
    setLoadingPreview(false);
    setPreviewError(null);
  }, []);

  const showEditFileModal = (file) => {
    setEditingFile({
      fileId: file._id,
      name: file.name,
      url: file.url,
      description: file.description,
      isDownloadable: file.isDownloadable,
      isViewable: file.isViewable,
    });
    setIsEditFileModalVisible(true);
  };
  const showRenameFileModal = (file) => {
    setRenamingFile({
      fileId: file._id,
      name: file.name,
    });
    setRenameFileModalVisible(true);
  };

  const handleEditFileModalCancel = useCallback(() => {
    setIsEditFileModalVisible(false);
  }, []);
  const handleRenameFileModalCancel = useCallback(() => {
    setRenameFileModalVisible(false);
  }, []);

  const handleEditFileChange = useCallback((field, value) => {
    setEditingFile((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleRenameChange = useCallback((newName) => {
    setRenamingFile((prev) => ({
      ...prev,
      name: newName,
    }));
  }, []);

  const handleSubmitFileEdit = useCallback(async () => {
    const { name, url, description, isDownloadable, isViewable } = editingFile;
    try {
      await dispatch(
        updateFileInFolder({
          folderId,
          fileId: editingFile.fileId,
          fileData: { name, url, description, isDownloadable, isViewable },
        })
      ).unwrap();
      setIsEditFileModalVisible(false);
    } catch (error) {
      console.error("Error updating file:", error.message);
    }
  }, [dispatch, folderId, editingFile]);

  const handleRenameFile = useCallback(async () => {
    const { name, fileId } = editingFile;
    try {
      await dispatch(
        updateFileInFolder({
          folderId,
          fileId,
          fileData: { name }, // Only updating the name
        })
      ).unwrap();

      setRenameFileModalVisible(false);
    } catch (error) {
      console.error("Error renaming file:", error.message);
    }
  }, [dispatch, folderId, editingFile]);

  useEffect(() => {
    if (!folderId) {
      return;
    }

    if (
      folderId === "[object Object]" ||
      folderId.toString() === "[object Object]"
    ) {
      message.error(
        "Invalid folder ID. Please navigate from the courses page again."
      );
      return;
    }

    const cleanFolderId =
      typeof folderId === "object" ? folderId._id || folderId.id : folderId;

    if (!cleanFolderId || typeof cleanFolderId !== "string") {
      message.error(
        "Invalid folder ID format. Please navigate from the courses page again."
      );
      return;
    }

    dispatch(getFolderContents(cleanFolderId));
  }, [dispatch, folderId]);

  const handleFolderClick = useCallback(
    (id) => {
      // Ensure we have a valid string ID
      const folderId = typeof id === 'object' ? id._id || id.id : id;

      if (!folderId) {
        console.error('❌ [ERROR] Invalid folder ID:', id);
        message.error('Invalid folder ID');
        return;
      }

      navigate(`/folder/${folderId}`);
    },
    [navigate]
  );

  const toggleViewMode = () => {
    setViewMode((prevMode) => (prevMode === "gallery" ? "list" : "gallery"));
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleAddFolder = useCallback(async () => {
    if (newFolderName.trim() === "") {
      alert("Folder name cannot be empty.");
      return;
    }
    try {
      const subfolderData = { name: newFolderName };
      await dispatch(addSubfolder({ folderId, subfolderData })).unwrap();
      setIsModalVisible(false);
      setNewFolderName("");
    } catch (error) {
      console.error("Error adding subfolder:", error);
    }
  }, [dispatch, folderId, newFolderName]);

  const handleCancel = () => {
    setIsModalVisible(false);
    setNewFolderName("");
  };

  const showUploadModal = () => {
    setIsUploadModalVisible(true);
  };

  const showUploadNotesModal = () => {
    setIsUploadNotesModalVisible(true);
  };

  const handleUpload = async () => {
    setUploadLoading(true);
    const formData = new FormData();
    videoFiles.forEach((file) => {
      formData.append("courseVideo", file);
    });
    formData.append("title", videoTitle);
    formData.append("description", videoDescription);

    try {
      const response = await api.post(
        `/admin/uploadCourseVideo/${folderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        message.success("Video uploaded successfully");
        setIsUploadModalVisible(false);
        setVideoFiles([]);
        setVideoTitle(""); // Clear title
        setVideoDescription(""); // Clear description
        setUploadLoading(false);
        dispatch(getFolderContents(folderId));
      } else {
        message.error("Failed to upload video");
        setUploadLoading(false);
      }
    } catch (error) {
      message.error("Upload error: " + error.message);
      setUploadLoading(false);
    }
  };

  const handleUploadNotes = async () => {
    setUploadLoading(true);
    const formData = new FormData();
    noteFiles.forEach((file) => {
      formData.append("courseNotes", file);
    });
    formData.append("title", notesTitle);
    formData.append("description", notesDescription);

    try {
      const response = await api.put(
        `/admin/uploadCourseNotes/${folderId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        message.success("Notes uploaded successfully");
        setIsUploadNotesModalVisible(false);
        setNoteFiles([]);
        setNotesTitle(""); // Clear title
        setNotesDescription(""); // Clear description
        setUploadLoading(false);
        dispatch(getFolderContents(folderId));
      } else {
        message.error("Failed to upload notes");
        setUploadLoading(false);
      }
    } catch (error) {
      message.error("Upload error: " + error.message);
      setUploadLoading(false);
    }
  };

  const renderError = () => {
    if (typeof error === "string") {
      return error;
    } else if (error && error.message) {
      return error.message;
    }
    return "Something went wrong";
  };

  const startEditing = (e, folderId, currentName) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    setEditingFolderId(folderId);
    setNewName(currentName);
  };

  const stopEditing = () => {
    setEditingFolderId(null);
    setNewName("");
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleDeleteFolder = async (folderId, sourceFolderId) => {
    if (window.confirm("Are you sure you want to delete this folder?")) {
      try {
        await dispatch(deleteFolder({ folderId, sourceFolderId })).unwrap();
        message.success("Folder deleted successfully");
      } catch (error) {
        message.error(error?.message || "Failed to delete folder");
      }
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await dispatch(deleteFileFromFolder({ folderId, fileId })).unwrap();
        message.success("File deleted successfully");
      } catch (error) {
        message.error("Failed to delete file");
      }
    }
  };
  const handleEditFolder = (folder) => {
    setEditingFolderId(folder._id); // Set the folder being edited
    setNewName(folder.name); // Prepopulate the modal with the current folder name
    setIsEditFolderModalVisible(true); // Show the modal
  };
  const handleSaveFolderEdit = async () => {
    if (newName.trim() === "") {
      message.error("Folder name cannot be empty.");
      return;
    }

    try {
      await dispatch(
        updateFolder({ id: editingFolderId, folderData: { name: newName } })
      ).unwrap();
      message.success("Folder updated successfully");
      setIsEditFolderModalVisible(false); // Close the modal
      setEditingFolderId(null);
      setNewName("");
      stopEditing();
    } catch (error) {
      message.error(
        "Failed to update folder: " + (error.message || "Unknown error")
      );
    }
  };

  const toggleFileLock = async (file) => {
    try {
      await dispatch(
        updateFileInFolder({
          folderId,
          fileId: file._id,
          fileData: { isViewable: !file.isViewable },
        })
      ).unwrap();
    } catch (error) {
      console.error("Error toggling file lock:", error.message);
    }
  };

  const toggleFolderDownloadable = async (folder) => {
    try {
      const newDownloadableState = !folder.isDownloadable;
      await dispatch(
        updateFolder({
          id: folder._id,
          folderData: {
            isDownloadable: newDownloadableState,
            downloadType: newDownloadableState ? "both" : "web"
          }
        })
      ).unwrap();
      message.success(`Folder download setting ${newDownloadableState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling folder downloadable:", error);
      message.error("Failed to update folder download setting");
    }
  };

  const menuForFolders = (folder) => {
    // 🗂️ NEW: Check if folder is a system folder that cannot be deleted
    const isSystemFolder = folder.isMasterFolder || (folder.isSystemFolder && !folder.isDeletable);
    const canEdit = !folder.isMasterFolder; // Master folder name cannot be edited

    return (
      <Menu>
        {canEdit && (
          <Menu.Item key="1" onClick={() => handleEditFolder(folder)}>
            Edit
          </Menu.Item>
        )}
        <Menu.Item key="download" onClick={() => toggleFolderDownloadable(folder)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Switch
              size="small"
              checked={folder.isDownloadable}
              onChange={() => toggleFolderDownloadable(folder)}
            />
            <span>
              {folder.isDownloadable ? '📥 Downloads Enabled' : '🚫 Downloads Disabled'}
            </span>
          </div>
        </Menu.Item>
        {!isSystemFolder && (
          <Menu.Item
            key="2"
            onClick={() => handleDeleteFolder(folder._id, folderId)}
          >
            Delete
          </Menu.Item>
        )}
        {isSystemFolder && (
          <Menu.Item key="3" disabled>
            <span style={{ color: '#999', fontSize: '12px' }}>
              {folder.isMasterFolder ? '🗂️ Master Folder - Protected' : '🔒 System Folder - Protected'}
            </span>
          </Menu.Item>
        )}
      </Menu>
    );
  };

  const menuForFiles = (file) => (
    <Menu>
      <Menu.Item key="delete" onClick={() => handleDeleteFile(file._id)}>
        Delete
      </Menu.Item>
      <Menu.Item key="rename" onClick={() => showRenameFileModal(file)}>
        Rename
      </Menu.Item>
      <Menu.Item key="edit" onClick={() => showEditFileModal(file)}>
        Edit Details
      </Menu.Item>
      <Menu.Item key="lock">
        <Switch
          checked={file.isViewable}
          onChange={() => toggleFileLock(file)}
          checkedChildren="Unlocked"
          unCheckedChildren="Locked"
        />
      </Menu.Item>
    </Menu>
  );

  if (folderLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Loading folder contents..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">Error loading folder</p>
          <p className="text-gray-500">{renderError()}</p>
          <Button
            type="primary"
            onClick={() => dispatch(getFolderContents(folderId))}
            className="mt-4"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!folder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">No folder data available</p>
          <Button
            type="primary"
            onClick={() => dispatch(getFolderContents(folderId))}
            className="mt-4"
          >
            Load Folder
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 text-white flex flex-col gap-10">
      <Modal
        title="Edit Folder Name"
        visible={isEditFolderModalVisible}
        onOk={handleSaveFolderEdit}
        onCancel={() => setIsEditFolderModalVisible(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="Folder Name"
          value={newName}
          onChange={handleNameChange}
        />
      </Modal>

      <Modal
        title="Edit File Details"
        visible={isEditFileModalVisible}
        onOk={() => handleSubmitFileEdit(editingFile.fileId, folderId)}
        onCancel={handleEditFileModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="File Name"
          value={editingFile.name}
          onChange={(e) => handleEditFileChange("name", e.target.value)}
        />
        {/* <Input
          style={{ marginTop: 8 }}
          placeholder="URL"
          value={editingFile.url}
          onChange={(e) => handleEditFileChange("url", e.target.value)}
        />
        <TextArea
          style={{ marginTop: 8 }}
          placeholder="Description"
          value={editingFile.description}
          onChange={(e) => handleEditFileChange("description", e.target.value)}
        /> */}
        <Checkbox
          style={{ marginTop: 8 }}
          checked={editingFile.isDownloadable}
          onChange={(e) =>
            handleEditFileChange("isDownloadable", e.target.checked)
          }
        >
          Downloadable
        </Checkbox>
        <Checkbox
          style={{ marginTop: 8 }}
          checked={editingFile.isViewable}
          onChange={(e) => handleEditFileChange("isViewable", e.target.checked)}
        >
          Viewable
        </Checkbox>
      </Modal>

      {/* New Modal only for Renaming files */}
      <Modal
        title="Edit File Name"
        visible={isRenameFileModalVisible}
        onOk={() => handleRenameFile(renamingFile.fileId, folderId)}
        onCancel={handleRenameFileModalCancel}
        okText="Save"
        cancelText="Cancel"
      >
        <Input
          placeholder="File Name"
          value={renamingFile.name}
          onChange={(e) => handleRenameChange("name", e.target.value)}
        />
      </Modal>

      {/* Main Content */}
      <>
        {/* Live Videos Folder Info Banner */}
        {/* {isLiveVideos && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <FaVideo className="text-blue-600 text-xl" />
              <div>
                <p className="text-blue-800 font-medium">🎥 Live Videos Folder</p>
                <p className="text-blue-600 text-sm">
                  This folder only displays video files. Only video files and folders containing videos can be copied here.
                </p>
              </div>
            </div>
          </div>
        )} */}

        <div className="flex justify-between items-center">
          {/* Back Button */}
          <Button
            type="default"
            icon={<FaArrowLeft />}
            onClick={() => navigate(-1)} // Navigate back to the previous page
            className="flex items-center"
          >
            Back
          </Button>
          <div className="flex gap-2">
            {!isLiveVideos && (
              <Button type="primary" icon={<FaPlus />} onClick={showModal}>
                Add Folder
              </Button>
            )}
            {/* <Button type="primary" icon={<FaPlus />} onClick={showUploadModal}>
            Upload Video
          </Button> */}
            {!isLiveVideos && (
              <Button
                type="primary"
                icon={<FaPlus />}
                onClick={showUploadNotesModal}
              >
                Upload Notes
              </Button>
            )}
            {!isLiveVideos && (
              <Button
                type="primary"
                icon={<FaFileImport />}
                onClick={toggleImportModal}
              // style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              >
                Copy Content
              </Button>
            )}
            {!isLiveVideos && (
              <Button
                type="primary"
                icon={<FaPlus />}
                onClick={showFreeClassModal}
              // style={{ backgroundColor: '#1890ff', borderColor: '#52c41a' }}
              >
                Add Free Class
              </Button>
            )}
            <Button
              type="default"
              icon={viewMode === "gallery" ? <FaList /> : <FaTh />}
              onClick={toggleViewMode}
            >
              {viewMode === "gallery" ? "List View" : "Gallery View"}
            </Button>
          </div>
        </div>
        {/* Modal for Add Folder */}
        <Modal
          title="Add New Folder"
          visible={isModalVisible}
          onOk={handleAddFolder}
          onCancel={handleCancel}
        >
          <Input
            placeholder="Folder Name"
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
          />
        </Modal>
        {/* Modal for Upload Video */}
        <Modal
          title="Upload Video"
          visible={isUploadModalVisible}
          onOk={handleUpload}
          onCancel={() => setIsUploadModalVisible(false)}
          confirmLoading={uploadLoading}
          okText="Upload"
        >
          <Input
            placeholder="Video Title"
            type="text"
            value={videoTitle}
            onChange={(e) => setVideoTitle(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextArea
            placeholder="Video Description"
            value={videoDescription}
            onChange={(e) => setVideoDescription(e.target.value)}
            style={{ marginBottom: "16px" }}
          />
          <Dragger
            accept="video/*"
            multiple={true}
            beforeUpload={(file) => {
              setVideoFiles([...videoFiles, file]);
              return false;
            }}
            showUploadList={true}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag video files to this area to upload
            </p>
          </Dragger>
        </Modal>
        {/* Modal for Upload Notes */}
        <Modal
          title="Upload Notes"
          visible={isUploadNotesModalVisible}
          onOk={handleUploadNotes}
          onCancel={() => setIsUploadNotesModalVisible(false)}
          confirmLoading={uploadLoading}
          okText="Upload"
        >
          <Input
            placeholder="Notes Title"
            type="text"
            value={notesTitle}
            onChange={(e) => setNotesTitle(e.target.value)}
            style={{ marginBottom: "8px" }}
          />
          <TextArea
            placeholder="Notes Description"
            value={notesDescription}
            onChange={(e) => setNotesDescription(e.target.value)}
            style={{ marginBottom: "16px" }}
          />
          <Dragger
            accept=".pdf,.doc,.docx,.txt"
            multiple={true}
            beforeUpload={(file) => {
              setNoteFiles([...noteFiles, file]);
              return false;
            }}
            showUploadList={true}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag notes files to this area to upload
            </p>
          </Dragger>
        </Modal>
        {/* Render Folder and File Contents */}
        {viewMode === "gallery" ? (
          <div className="flex flex-wrap gap-6">
            {folder?.folders.map((folderObject) => (
              <div
                key={folderObject._id}
                onClick={() => handleFolderClick(folderObject._id)}
                className="flex flex-col items-center gap-2"
              >
                <FaFolder className="text-blue-600" size={50} />
                <span className="text-center">{folderObject.name}</span>
              </div>
            ))}
            {displayFiles.map((file) => (
              <div key={file._id} className="flex flex-col items-center gap-2">
                <FaFile size={50} />
                <a target="_blank" rel="noreferrer" href={file.url}>
                  {file.name || "File"}
                </a>
              </div>
            ))}
            {!folder?.folders?.length && !displayFiles.length && (
              <p className="text-red-500">
                {isLiveVideos
                  ? "No video files found. Upload videos or copy video files/folders from other locations."
                  : "No files or folders"
                }
              </p>
            )}
          </div>
        ) : (
          <div className="w-full bg-white rounded-lg overflow-hidden shadow-sm">
            <table className="table-auto w-full text-left border-collapse">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Preview</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="fileList">
                  {(provided) => (
                    <tbody
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="w-full"
                    >
                      {/* Render Folders */}
                      {folder?.folders?.map((folderObject) => (
                        <tr key={folderObject._id} className="border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-6 py-4">
                            <div
                              className={`flex items-center justify-center w-16 h-16 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 shadow-sm ${folderObject.isMasterFolder
                                ? 'bg-gradient-to-br from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300'
                                : folderObject.isSystemFolder
                                  ? 'bg-gradient-to-br from-orange-100 to-orange-200 hover:from-orange-200 hover:to-orange-300'
                                  : 'bg-gradient-to-br from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300'
                                }`}
                              onClick={() => handleFolderClick(folderObject._id)}
                            >
                              {folderObject.isMasterFolder ? (
                                <div className="flex flex-col items-center">
                                  <FaFolder className="text-purple-600 text-xl" />
                                  <span className="text-xs text-purple-600 mt-1">👑</span>
                                </div>
                              ) : folderObject.isSystemFolder ? (
                                <div className="flex flex-col items-center">
                                  <FaFolder className="text-orange-600 text-xl" />
                                  <FaLock className="text-orange-600 text-xs mt-1" />
                                </div>
                              ) : (
                                <FaFolder className="text-blue-600 text-2xl" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-medium cursor-pointer transition-colors duration-200 ${folderObject.isMasterFolder
                                    ? 'text-purple-800 hover:text-purple-600'
                                    : folderObject.isSystemFolder
                                      ? 'text-orange-800 hover:text-orange-600'
                                      : 'text-gray-800 hover:text-blue-600'
                                    }`}
                                  onClick={(e) => {
                                    if (!folderObject.isMasterFolder) {
                                      startEditing(e, folderObject._id, folderObject.name);
                                    }
                                  }}
                                >
                                  {folderObject.name}
                                </span>
                                {folderObject.isMasterFolder && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    👑 Master
                                  </span>
                                )}
                                {folderObject.isSystemFolder && !folderObject.isMasterFolder && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                    🔒 System
                                  </span>
                                )}
                              </div>
                              <span className="text-sm text-gray-500 mt-1">
                                {(folderObject.files?.length || 0) + (folderObject.folders?.length || 0)} items
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <FaFolder className="w-3 h-3 mr-1 text-blue-600" />
                              Folder
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Dropdown
                              overlay={menuForFolders(folderObject)}
                              trigger={["click"]}
                              placement="bottomRight"
                            >
                              <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                <FaEllipsisV className="text-gray-600" />
                              </button>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}

                      {/* Render Files with Drag and Drop */}
                      {displayFiles.map((file, index) => {
                        const { icon: FileIcon, color, bgColor } = getFileIcon(file.name, file.url, file.type);
                        return (
                          <Draggable
                            key={file._id}
                            draggableId={file._id}
                            index={index}
                          >
                            {(provided) => (
                              <tr
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                              >
                                <td className="px-6 py-4">
                                  <div
                                    className="flex items-center justify-center w-16 h-16 rounded-xl cursor-pointer hover:scale-105 transition-all duration-300 shadow-sm relative group"
                                    style={{ backgroundColor: bgColor }}
                                    onClick={() => handlePreview(file)}
                                  >
                                    <FileIcon
                                      className="text-2xl"
                                      style={{ color: color }}
                                    />
                                    {/* Lock/Unlock indicator */}
                                    <div className="absolute -top-1 -right-1">
                                      {file.isViewable ? (
                                        <FaUnlock className="w-3 h-3 text-green-500 bg-white rounded-full p-0.5 shadow-sm" />
                                      ) : (
                                        <FaLock className="w-3 h-3 text-red-500 bg-white rounded-full p-0.5 shadow-sm" />
                                      )}
                                    </div>
                                    {/* Play button for videos */}
                                    {(file.url?.includes('.mp4') || file.url?.includes('.webm') || file.url?.includes('.avi')) && (
                                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <FaPlay className="text-white text-sm bg-black bg-opacity-70 rounded-full p-2 w-8 h-8" />
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col">
                                    <span
                                      className="font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors duration-200 line-clamp-1"
                                      onClick={() => handlePreview(file)}
                                      title={file.name}
                                    >
                                      {file.name || "File"}
                                    </span>
                                    <span className="text-sm text-gray-500 mt-1">
                                      {file.url?.split('.').pop()?.toUpperCase()} file
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    {file.isViewable ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <FaUnlock className="w-3 h-3 mr-1" />
                                        Unlocked
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        <FaLock className="w-3 h-3 mr-1" />
                                        Locked
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <Dropdown
                                    overlay={menuForFiles(file)}
                                    trigger={["click"]}
                                    placement="bottomRight"
                                  >
                                    <button className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200">
                                      <FaEllipsisV className="text-gray-600" />
                                    </button>
                                  </Dropdown>
                                </td>
                              </tr>
                            )}
                          </Draggable>
                        );
                      })}
                      {provided.placeholder}

                      {/* No files or folders message */}
                      {!folder?.folders?.length && !folder?.files?.length && (
                        <tr>
                          <td colSpan="4" className="text-center py-16">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <AiOutlineFile className="text-6xl mb-4 opacity-50" />
                              <p className="text-lg font-medium text-gray-600">No files or folders</p>
                              <p className="text-sm text-gray-500 mt-1">Upload some files or create folders to get started</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  )}
                </Droppable>
              </DragDropContext>
            </table>
          </div>
        )}

        <Modal
          title={previewContent?.name}
          visible={isPreviewModalVisible}
          footer={null}
          onCancel={closePreviewModal}
          centered
          width="80%"
          style={{ maxWidth: "1200px" }}
        >
          {loadingPreview ? (
            <div className="flex items-center justify-center p-8">
              <Spin size="large" />
              <span className="ml-4">Loading preview...</span>
            </div>
          ) : previewError ? (
            <div className="flex flex-col items-center justify-center p-8">
              <p className="text-red-500 mb-4">{previewError}</p>
              <Button onClick={() => handlePreview(previewContent)} type="primary">
                Retry
              </Button>
            </div>
          ) : securePreviewUrl ? (
            (() => {
              const fileExtension = previewContent?.url?.split('.').pop()?.toLowerCase() || '';
              const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
              const isPdfFile = fileExtension === 'pdf';
              const isVideoFile = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(fileExtension);

              if (isPdfFile) {
                return (
                  <iframe
                    src={securePreviewUrl}
                    className="w-full h-96"
                    title={previewContent.name}
                  />
                );
              } else if (isVideoFile) {
                return (
                  <video
                    src={securePreviewUrl}
                    controls
                    className="w-full"
                    controlsList="nodownload noremoteplayback"
                    disablePictureInPicture
                    style={{ maxHeight: "70vh" }}
                    onError={(e) => {
                      console.error("Video playback error:", e);
                      setPreviewError("Video playback failed. The file might be corrupted or unsupported.");
                    }}
                  />
                );
              } else if (isImageFile) {
                return (
                  <div className="flex justify-center items-center p-4">
                    <img
                      src={securePreviewUrl}
                      alt={previewContent.name}
                      className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
                      onError={(e) => {
                        console.error("Image load error:", e);
                        setPreviewError("Image failed to load. The file might be corrupted or unsupported.");
                      }}
                    />
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <a
                      href={securePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Open File
                    </a>
                  </div>
                );
              }
            })()
          ) : (
            <div className="flex items-center justify-center p-8">
              <p>No preview available</p>
            </div>
          )}
        </Modal>
        <ImportModal
          isVisible={isImportModalVisible}
          onClose={toggleImportModal}
          destinationFolderId={folderId}
          id={folderId}
          isLiveVideosFolder={isLiveVideos}
        />

        {/* Modal for Add Free Class */}
        <Modal
          title="Add Free Class"
          visible={isFreeClassModalVisible}
          onOk={handleAddFreeClass}
          onCancel={handleFreeClassCancel}
          confirmLoading={freeClassLoading}
          okText="Add Free Class"
          cancelText="Cancel"
          width={600}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Class Name *
              </label>
              <Input
                placeholder="Enter class name (e.g., Introduction to React)"
                value={freeClassName}
                onChange={(e) => setFreeClassName(e.target.value)}
                size="large"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube URL *
              </label>
              <Input
                placeholder="https://www.youtube.com/watch?v=..."
                value={freeClassUrl}
                onChange={(e) => setFreeClassUrl(e.target.value)}
                size="large"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste the full YouTube video URL here
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <TextArea
                placeholder="Brief description of the class content..."
                value={freeClassDescription}
                onChange={(e) => setFreeClassDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </Modal>
      </>
    </div>
  );
};

export default HOC(FolderContents);
