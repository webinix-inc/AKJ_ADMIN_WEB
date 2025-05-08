import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Typography,
  Spin,
  Upload,
  Modal,
  Form,
  Input,
  Tabs,
  Popconfirm,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import axios from "axios";
import { toast } from "react-toastify";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";

const { Title } = Typography;
const { TabPane } = Tabs;

const ChapterContent = () => {
  const { id, chapterId } = useParams(); // Extract subjectId and chapterId from URL params
  const [chapterVideos, setChapterVideos] = useState([]); // Holds videos for the chapter
  const [chapterNotes, setChapterNotes] = useState([]); // Holds notes for the chapter
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("videos"); // State for active tab
  const [uploading, setUploading] = useState(false); // State for upload loading
  const [previewFile, setPreviewFile] = useState(null); // State for previewing files
  const [fileList, setFileList] = useState([]); // For handling the list of files in Upload
  const [form] = Form.useForm();

  // Fetch subject data, get chapters, and retrieve videos and notes for the specific chapter
  useEffect(() => {
    fetchChapterContent();
  }, [id, chapterId]);

  const fetchChapterContent = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/subjects/${id}`);
      const subject = response.data.data;
      const chapter = subject[0].chapters.find((ch) => ch._id === chapterId);
      if (chapter) {
        setChapterVideos(chapter.videos);
        setChapterNotes(chapter.notes);
      } else {
        toast.error("Chapter not found");
      }
    } catch (error) {
      toast.error("Failed to fetch chapter content");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (videoUrl) => {
    try {
      await api.delete(`/admin/deleteCourseVideo/${id}/${chapterId}`, {
        data: { videoUrls: [videoUrl] },
      });
      toast.success("Video deleted successfully");
      fetchChapterContent(); // Refresh videos after deletion
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };
  // Handle video or note upload based on active tab
  const handleUpload = async (values) => {
    setUploading(true); // Show loading on upload button
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");

    if (activeTab === "videos") {
      values.file.fileList.forEach((file) => {
        formData.append("courseVideo", file.originFileObj);
      });
      try {
        await api.post(
          `/admin/uploadCourseVideo/${id}/${chapterId}`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Videos uploaded successfully");
        form.resetFields();
        setIsModalVisible(false);
        setFileList(null);
        setPreviewFile(null);
        setUploading(false); // Hide loading on upload button

        // Refresh chapter videos after upload
        const response = await api.get(`/admin/subjects/${id}`);
        const updatedChapter = response.data.data[0].chapters.find(
          (ch) => ch._id === chapterId
        );
        if (updatedChapter) {
          setChapterVideos(updatedChapter.videos);
        }
      } catch (error) {
        console.error("Failed to upload videos:", error);
        toast.error("Failed to upload videos");
        setUploading(false); // Hide loading on upload button
      }
    } else if (activeTab === "notes") {
      values.file.fileList.forEach((file) => {
        formData.append("courseNotes", file.originFileObj); // Append each file to formData
      });

      // Append title and content to formData
      formData.append("title", values.title); // Append title
      formData.append("content", values.description || ""); // Append content (optional)

      try {
        await api.put(`/admin/uploadCourseNotes/${id}/${chapterId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Notes uploaded successfully");
        form.resetFields();
        setIsModalVisible(false);
        setPreviewFile(null);
        setFileList(null);
        setUploading(false); // Hide loading on upload button

        // Refresh chapter notes after upload
        const response = await api.get(`/admin/subjects/${id}`);
        console.log(response.data.data);
        const updatedChapter = response.data.data[0].chapters.find(
          (ch) => ch._id === chapterId
        );
        if (updatedChapter) {
          setChapterNotes(updatedChapter.notes); // Update notes in the state
        }
      } catch (error) {
        console.error("Failed to upload notes:", error);
        toast.error("Failed to upload notes");
        setUploading(false); // Hide loading on upload button
      }
    }
  };
  // Handle file preview
  const handlePreview = async (file) => {
    if (activeTab === "videos") {
      const videoUrl = URL.createObjectURL(file.originFileObj);
      setPreviewFile(videoUrl); // Set the file to preview
    } else if (activeTab === "notes") {
      setPreviewFile(file.thumbUrl); // Set preview for notes (PDF, DOCX, etc.)
    }
  };

  const showUploadModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setPreviewFile(null);
    setFileList(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header with back arrow and upload button */}
      <div className="flex justify-between items-center mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={showUploadModal}
        >
          Upload {activeTab === "videos" ? "Video" : "Note"}
        </Button>
      </div>

      <Title className="text-white" level={2}>
        Content for Chapter
      </Title>

      {/* Tabs for switching between videos and notes */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        tabBarStyle={{ color: "white", fontSize: "18px", textAlign: "center" }} // Adjust text color and font size
        centered // Center the tabs
      >
        <TabPane
          tab={<span style={{ fontSize: "20px" }}>Videos</span>}
          key="videos"
        >
          <div className="grid grid-cols-3 gap-4">
            {chapterVideos.map((video) => (
              <Card
                key={video._id}
                className="flex flex-col items-center justify-center"
                hoverable
                style={{ textAlign: "center" }}
              >
                <video width="100%" controls src={video.url}></video>
                <Title level={4}>{video.title}</Title>
                <Popconfirm
                  title="Are you sure to delete this video?"
                  onConfirm={() => handleDelete(video.url)}
                  okText="Yes"
                  cancelText="No"
                >
                  <Button icon={<DeleteOutlined />} type="danger">
                    Delete
                  </Button>
                </Popconfirm>
              </Card>
            ))}
          </div>
        </TabPane>

        <TabPane
          tab={<span style={{ color: "white", fontSize: "20px" }}>Notes</span>}
          key="notes"
        >
          {/* Display notes with hover preview and click-to-open in a new tab */}
          <div className="grid grid-cols-3 gap-4">
            {chapterNotes.length > 0 ? (
              chapterNotes.map((note) => (
                <Card
                  key={note._id}
                  className="custom-card relative flex flex-col items-center justify-center" // Custom class for additional styling
                  hoverable
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    overflow: "hidden",
                    position: "relative",
                  }}
                  onClick={() => window.open(note.fileUrl, "_blank")} // Opens in a new tab on click
                >
                  {/* Note Preview (assuming PDF) */}
                  <iframe
                    src={note.fileUrl}
                    title={note.title}
                    style={{
                      width: "100%",
                      height: "300px",
                      border: "none",
                    }}
                  ></iframe>

                  {/* Overlay that appears on hover */}
                  <div
                    className="note-overlay absolute inset-0 bg-black bg-opacity-50 transition-opacity duration-300 flex flex-col justify-center items-center text-white p-4"
                    style={{
                      opacity: 0,
                      backdropFilter: "blur(5px)",
                    }}
                  >
                    <h3 style={{ fontSize: "18px", fontWeight: "bold" }}>
                      {note.title}
                    </h3>
                    <p style={{ color: "#ccc" }}>{note.description}</p>
                  </div>

                  {/* Hover effect using CSS */}
                  <style>{`
          .custom-card:hover .note-overlay {
            opacity: 1;
          }
        `}</style>
                </Card>
              ))
            ) : (
              <p>No notes found for this chapter.</p>
            )}
          </div>
        </TabPane>
      </Tabs>

      {/* Modal for uploading video or note */}
      <Modal
        title={`Upload ${activeTab === "videos" ? "Video" : "Note"}`}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="title"
            label="Title"
            rules={[
              {
                required: true,
                message: `Please enter the ${
                  activeTab === "videos" ? "video" : "note"
                } title`,
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item
            name="file"
            label={`${activeTab === "videos" ? "Video" : "Note"} Files`}
            rules={[
              {
                required: true,
                message: `Please upload at least one ${
                  activeTab === "videos" ? "video" : "note"
                }`,
              },
            ]}
          >
            <Upload
              beforeUpload={() => false}
              multiple
              accept={
                activeTab === "videos"
                  ? "video/*"
                  : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              }
              onPreview={handlePreview} // Preview the uploaded files
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)} // Track selected files
            >
              <Button icon={<UploadOutlined />}>Click to Upload</Button>
            </Upload>
          </Form.Item>

          {/* File preview */}
          {previewFile && activeTab === "videos" && (
            <video width="100%" height="auto" controls>
              <source src={previewFile} type="video/mp4" />
            </video>
          )}
          {previewFile && activeTab === "notes" && (
            <embed
              src={previewFile}
              type="application/pdf"
              width="100%"
              height="400px"
            />
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>
              {uploading
                ? "Uploading..."
                : `Upload ${activeTab === "videos" ? "Video" : "Note"}`}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ChapterContent);
