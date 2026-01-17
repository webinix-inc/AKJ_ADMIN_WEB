import React, { useState, useEffect, memo, useCallback } from "react";
import { useParams } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Tabs,
  Upload,
} from "antd";
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  UploadOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  InboxOutlined
} from "@ant-design/icons";
import { toast } from "react-toastify";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";

import "./Content.css";



// Styles
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '24px',
  },
  card: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  cardContent: {
    padding: '16px',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#fff',
    marginBottom: '8px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardDesc: {
    fontSize: '13px',
    color: '#888',
    marginBottom: '16px',
    height: '40px',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  videoContainer: {
    position: 'relative',
    paddingTop: '56.25%', // 16:9 aspect ratio
    background: '#000',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  notePreview: {
    height: '200px',
    background: '#262626',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '8px',
    marginTop: '12px',
    borderTop: '1px solid #262626',
    paddingTop: '12px',
  },
  skeleton: {
    background: '#262626',
    borderRadius: '16px',
    height: '300px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '64px',
    color: '#666',
  },
  tabBar: {
    color: 'white',
    fontSize: '16px',
    marginBottom: '24px',
  },
};

// Video Card Component
const VideoCard = memo(({ video, onDelete }) => (
  <div style={styles.card} className="hover:shadow-lg hover:-translate-y-1">
    <div style={styles.videoContainer}>
      <video
        style={styles.video}
        controls
        src={video.url}
        className="object-cover"
      />
    </div>
    <div style={styles.cardContent}>
      <h3 style={styles.cardTitle} title={video.title}>{video.title}</h3>
      <p style={styles.cardDesc} title={video.description}>{video.description || "No description available"}</p>

      <div style={styles.actions}>
        <Popconfirm
          title="Delete this video?"
          onConfirm={() => onDelete(video.url)}
          okText="Yes"
          cancelText="No"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
          >
            Delete
          </Button>
        </Popconfirm>
      </div>
    </div>
  </div>
));

// Note Card Component
const NoteCard = memo(({ note }) => (
  <div
    style={styles.card}
    className="hover:shadow-lg hover:-translate-y-1 cursor-pointer group"
    onClick={() => window.open(note.fileUrl, "_blank")}
  >
    <div style={styles.notePreview} className="group-hover:bg-[#333] transition-colors">
      <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px', color: '#3b82f6' }} />
      <span className="text-gray-400">Click to Preview</span>
    </div>
    <div style={styles.cardContent}>
      <h3 style={styles.cardTitle} title={note.title}>{note.title}</h3>
      <p style={styles.cardDesc} title={note.description}>{note.description || "No description available"}</p>
    </div>
  </div>
));

// Skeleton Loader
const ContentSkeleton = memo(() => (
  <div style={styles.skeleton} />
));

const ChapterContent = () => {
  const { id, chapterId } = useParams();
  const [chapterVideos, setChapterVideos] = useState([]);
  const [chapterNotes, setChapterNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("videos");
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [form] = Form.useForm();
  const [chapterName, setChapterName] = useState("");

  const fetchChapterContent = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/subjects/${id}`);
      const subject = response.data.data;
      const chapter = subject[0].chapters.find((ch) => ch._id === chapterId);
      if (chapter) {
        setChapterName(chapter.name);
        setChapterVideos(chapter.videos || []);
        setChapterNotes(chapter.notes || []);
      } else {
        toast.error("Chapter not found");
      }
    } catch (error) {
      toast.error("Failed to fetch chapter content");
    } finally {
      setLoading(false);
    }
  }, [id, chapterId]);

  useEffect(() => {
    fetchChapterContent();
  }, [fetchChapterContent]);

  const handleDelete = async (videoUrl) => {
    try {
      await api.delete(`/admin/deleteCourseVideo/${id}/${chapterId}`, {
        data: { videoUrls: [videoUrl] },
      });
      toast.success("Video deleted successfully");
      fetchChapterContent();
    } catch (error) {
      toast.error("Failed to delete video");
    }
  };

  const handleUpload = async (values) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description || "");

    try {
      if (activeTab === "videos") {
        if (values.file?.fileList) {
          values.file.fileList.forEach((file) => {
            formData.append("courseVideo", file.originFileObj);
          });
        }
        await api.post(
          `/admin/uploadCourseVideo/${id}/${chapterId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        toast.success("Videos uploaded successfully");
      } else {
        if (values.file?.fileList) {
          values.file.fileList.forEach((file) => {
            formData.append("courseNotes", file.originFileObj);
          });
        }
        formData.append("content", values.description || "");
        await api.put(`/admin/uploadCourseNotes/${id}/${chapterId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Notes uploaded successfully");
      }

      form.resetFields();
      setIsModalVisible(false);
      setFileList([]);
      fetchChapterContent();
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error(`Failed to upload ${activeTab}`);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setFileList([]);
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => window.history.back()}
            style={{ marginBottom: '16px' }}
          >
            Back to Chapters
          </Button>
          <h2 style={styles.title}>
            {loading ? "Loading..." : chapterName || "Chapter Content"}
          </h2>
        </div>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setIsModalVisible(true)}
          size="large"
        >
          Upload {activeTab === "videos" ? "Video" : "Note"}
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="custom-tabs"
        items={[
          {
            key: "videos",
            label: (
              <span className="text-lg flex items-center gap-2 px-4 py-2">
                <PlayCircleOutlined /> Videos
              </span>
            ),
            children: (
              <div style={styles.grid}>
                {loading ? (
                  [1, 2, 3].map(i => <ContentSkeleton key={i} />)
                ) : chapterVideos.length > 0 ? (
                  chapterVideos.map((video) => (
                    <VideoCard
                      key={video._id}
                      video={video}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <PlayCircleOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <p>No videos uploaded yet</p>
                  </div>
                )}
              </div>
            ),
          },
          {
            key: "notes",
            label: (
              <span className="text-lg flex items-center gap-2 px-4 py-2">
                <FileTextOutlined /> Notes
              </span>
            ),
            children: (
              <div style={styles.grid}>
                {loading ? (
                  [1, 2, 3].map(i => <ContentSkeleton key={i} />)
                ) : chapterNotes.length > 0 ? (
                  chapterNotes.map((note) => (
                    <NoteCard key={note._id} note={note} />
                  ))
                ) : (
                  <div style={styles.emptyState}>
                    <FileTextOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                    <p>No notes uploaded yet</p>
                  </div>
                )}
              </div>
            ),
          },
        ]}
      />

      {/* Upload Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>Upload {activeTab === "videos" ? "Video" : "Note"}</span>}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleUpload}>
          <Form.Item
            name="title"
            label={<span style={{ color: '#d4d4d4' }}>Title</span>}
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input placeholder="Enter title" />
          </Form.Item>

          <Form.Item
            name="description"
            label={<span style={{ color: '#d4d4d4' }}>Description</span>}
          >
            <Input.TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            name="file"
            label={<span style={{ color: '#d4d4d4' }}>{activeTab === "videos" ? "Video" : "Note"} Files</span>}
            rules={[{ required: true, message: "Please upload at least one file" }]}
          >
            <Upload
              beforeUpload={() => false}
              multiple
              accept={
                activeTab === "videos"
                  ? "video/*"
                  : "application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              }
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
            >
              <Button icon={<InboxOutlined />} block style={{ height: '100px' }}>
                Click or drag files to upload
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={uploading}
              block
              size="large"
            >
              {uploading ? "Uploading..." : `Upload ${activeTab === "videos" ? "Video" : "Note"}`}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Custom Styles for Ant Design Tabs in Dark Mode */}
      <style>{`
        .custom-tabs .ant-tabs-nav::before {
          border-bottom: 1px solid #262626;
        }
        .custom-tabs .ant-tabs-tab {
          color: #888;
          transition: color 0.3s;
          padding: 12px 0;
        }
        .custom-tabs .ant-tabs-tab:hover {
          color: #fff;
        }
        .custom-tabs .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn {
          color: #fff;
          font-weight: 600;
        }
        .custom-tabs .ant-tabs-ink-bar {
          background: #3b82f6;
          height: 3px;
        }
      `}</style>
    </div>
  );
};

export default HOC(ChapterContent);
