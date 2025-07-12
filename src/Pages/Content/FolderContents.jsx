import {
  FaFile,
  FaFolder,
  FaPlus,
  FaTh,
  FaList,
  FaArrowLeft,
  FaPlay,
  FaDownload,
} from "react-icons/fa";
import { BiSolidFilePdf } from "react-icons/bi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import HOC from "../../Component/HOC/HOC";
import { Checkbox, Input, Modal, Spin, Switch, Upload, message } from "antd";
import { Button } from "react-bootstrap";
import {
  addSubfolder,
  deleteFileFromFolder,
  deleteFolder,
  getFolderContents,
  updateFileInFolder,
  updateFileOrder,
  updateFolder,
} from "../../redux/slices/contentSlice";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { InboxOutlined } from "@ant-design/icons";
import api from "../../api/axios";
import { Menu, Dropdown } from "antd";
import { FaEllipsisV } from "react-icons/fa";
import TextArea from "antd/es/input/TextArea";
import ImportModal from "./ImportModal";

const { Dragger } = Upload;

const FolderContents = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Memoize selector to prevent unnecessary re-renders
  const folder = useSelector(
    (state) => state.content.folders[folderId],
    (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
  );
  const loading = useSelector((state) => state.content.loading);
  const error = useSelector((state) => state.content.error);
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

  const handleDragEnd = async (result) => {
    const { destination, source } = result;

    // If dropped outside or no destination, do nothing
    if (!destination || destination.index === source.index) {
      return;
    }

    // Reorder files in the state
    const updatedFiles = Array.from(folder.files);
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

  const handlePreview = useCallback((file) => {
    setPreviewContent(file);
    setIsPreviewModalVisible(true);
  }, []);

  const toggleImportModal = useCallback(() => {
    setIsImportModalVisible((prev) => !prev);
  }, []);

  const closePreviewModal = useCallback(() => {
    setPreviewContent(null);
    setIsPreviewModalVisible(false);
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
      dispatch(getFolderContents(folderId));
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
      dispatch(getFolderContents(folderId));
    } catch (error) {
      console.error("Error renaming file:", error.message);
    }
  }, [dispatch, folderId, editingFile]);

  useEffect(() => {
    dispatch(getFolderContents(folderId));
  }, [dispatch, folderId]);

  const handleFolderClick = useCallback(
    (id) => {
      navigate(`/folder/${id}`);
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
      console.log("Subfolder added successfully");
      setIsModalVisible(false);
      setNewFolderName("");
      dispatch(getFolderContents(folderId));
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
    e.stopPropagation();
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

  // const handleSubmit = (id) => {
  //   if (newName.trim() === "") return;
  //   dispatch(updateFolder({ id, folderData: { name: newName } }))
  //     .unwrap()
  //     .then(() => {
  //       console.log("Folder updated successfully");
  //       stopEditing();
  //       dispatch(getFolderContents(folderId));
  //     })
  //     .catch((error) => {
  //       console.error("Error updating folder:", error);
  //     });
  // };

  const handleDeleteFolder = async (folderId, sourceFolderId) => {
    if (window.confirm("Are you sure you want to delete this folder?")) {
      try {
        await dispatch(deleteFolder({ folderId, sourceFolderId })).unwrap();
        message.success("Folder deleted successfully");
        dispatch(getFolderContents(sourceFolderId)); // Refresh the source folder's contents
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
      dispatch(getFolderContents(folderId)); // Refresh folder contents
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
      // dispatch(getFolderContents(folderId));
    } catch (error) {
      console.error("Error toggling file lock:", error.message);
    }
  };

  const menuForFolders = (folder) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleEditFolder(folder)}>
        Edit
      </Menu.Item>
      <Menu.Item
        key="2"
        onClick={() => handleDeleteFolder(folder._id, folderId)}
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  const menuForFiles = (file) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleDeleteFile(file._id)}>
        Delete
      </Menu.Item>
      <Menu.Item key="2" onClick={() => showEditFileModal(file)}>
        {/* Edit */}
        Rename
      </Menu.Item>
      <Menu.Item key="3">
        <Switch
          checked={file.isViewable} // True = Unlocked, False = Locked
          onChange={() => toggleFileLock(file)}
          checkedChildren="Unlocked"
          unCheckedChildren="Locked"
        />
      </Menu.Item>
    </Menu>
  );
  const menuForFilesNew = (file) => (
    <Menu>
      <Menu.Item key="1" onClick={() => handleDeleteFile(file._id)}>
        Delete
      </Menu.Item>
      <Menu.Item key="2" onClick={() => showRenameFileModal(file)}>
        Rename
      </Menu.Item>
      <Menu.Item key="3">
        <Switch
          checked={file.isViewable} // True = Unlocked, False = Locked
          onChange={() => toggleFileLock(file)}
          checkedChildren="Unlocked"
          unCheckedChildren="Locked"
        />
      </Menu.Item>
    </Menu>
  );

  if (loading) return <Spin />;
  if (error) return <div>Error: {renderError()}</div>;

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
          onChange={(e) => setNewName(e.target.value)}
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
        {/* <Checkbox
          style={{ marginTop: 8 }}
          checked={editingFile.isDownloadable}
          onChange={(e) =>
            handleEditFileChange("isDownloadable", e.target.checked)
          }
        >
          Downloadable
        </Checkbox> */}
        {/* <Checkbox
          style={{ marginTop: 8 }}
          checked={editingFile.isViewable}
          onChange={(e) => handleEditFileChange("isViewable", e.target.checked)}
        >
          Viewable
        </Checkbox> */}
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
          <Button type="primary" icon={<FaPlus />} onClick={showModal}>
            Add Folder
          </Button>
          <Button type="primary" icon={<FaPlus />} onClick={showUploadModal}>
            Upload Video
          </Button>
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={showUploadNotesModal}
          >
            Upload Notes
          </Button>
          <Button
            type="primary"
            icon={<FaDownload />}
            onClick={toggleImportModal}
          >
            Import
          </Button>
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
              <FaFolder color="blue" size={50} />
              <span className="text-center">{folderObject.name}</span>
            </div>
          ))}
          {folder?.files.map((file) => (
            <div key={file._id} className="flex flex-col items-center gap-2">
              <FaFile size={50} />
              <a target="_blank" rel="noreferrer" href={file.url}>
                {file.name || "File"}
              </a>
            </div>
          ))}
          {!folder?.folders.length && !folder?.files.length && (
            <p className="text-red-500">No files or folders</p>
          )}
        </div>
      ) : (
        <div className="w-full">
          <table className="table-auto w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2">Type</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Actions</th>
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
                      <tr key={folderObject._id} className="border-b">
                        <td
                          className="px-4 py-2 cursor-pointer"
                          onClick={() => handleFolderClick(folderObject._id)}
                        >
                          <FaFolder size={50} color="blue" />
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="cursor-pointer"
                            onClick={(e) =>
                              startEditing(
                                e,
                                folderObject._id,
                                folderObject.name
                              )
                            }
                          >
                            {folderObject.name}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <Dropdown
                            overlay={menuForFolders(folderObject)}
                            trigger={["click"]}
                          >
                            <a
                              className="ant-dropdown-link"
                              onClick={(e) => e.preventDefault()}
                            >
                              <FaEllipsisV />
                            </a>
                          </Dropdown>
                        </td>
                      </tr>
                    ))}

                    {/* Render Files with Drag and Drop */}
                    {folder?.files.map((file, index) => (
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
                            className="border-b"
                          >
                            <td className="px-4 py-2">
                              {file.url && file.url.endsWith(".pdf") ? (
                                // <div
                                //   className="relative cursor-pointer"
                                //   onClick={() => handlePreview(file)}
                                // >
                                //   <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                //     {/* <FaPlay className="text-white text-lg" /> */}
                                //     {/* <FilePdfOutlined className="text-white text-lg" /> */}
                                //     <BiSolidFilePdf />
                                //   </div>
                                //   {/* <span className="block">PDF File</span> */}
                                // </div>
                                <div
                                  className="relative  w-[5rem] h-[5rem] cursor-pointer group"
                                  onClick={() => handlePreview(file)}
                                >
                                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-md">
                                    <BiSolidFilePdf className="text-[2rem] text-white" />
                                  </div>
                                </div>
                              ) : file.url && file.url.endsWith(".mp4") ? (
                                <div
                                  className="relative cursor-pointer"
                                  onClick={() => handlePreview(file)}
                                >
                                  <video
                                    src={file.url}
                                    className="h-16 w-20 object-cover"
                                    muted
                                  />
                                  <div className="absolute inset-0 w-20 flex items-center justify-center bg-black bg-opacity-50">
                                    <FaPlay className="text-white text-lg" />
                                  </div>
                                </div>
                              ) : (
                                <span>Preview not available</span>
                              )}
                            </td>
                            <td className="px-4 py-2">
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={file.url}
                              >
                                {file.name || "File"}
                              </a>
                            </td>
                            <td className="px-4 py-2">
                              <Dropdown
                                overlay={menuForFiles(file)}
                                trigger={["click"]}
                              >
                                <a
                                  className="ant-dropdown-link"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <FaEllipsisV />
                                </a>
                              </Dropdown>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}

                    {/* No files or folders message */}
                    {!folder?.folders?.length && !folder?.files?.length && (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-red-500 text-center py-4"
                        >
                          No files or folders
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
      >
        {previewContent?.url.endsWith(".pdf") ? (
          <iframe
            src={previewContent.url}
            className="w-full h-96"
            title={previewContent.name}
          />
        ) : (
          <video src={previewContent?.url} controls className="w-full" />
        )}
      </Modal>
      <ImportModal
        isVisible={isImportModalVisible}
        onClose={toggleImportModal}
        destinationFolderId={folderId}
        id={folderId}
      />
    </div>
  );
};

export default HOC(FolderContents);
