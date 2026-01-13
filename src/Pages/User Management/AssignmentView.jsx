import React, { useState, useEffect } from 'react';
import {
  Table,
  Card,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Typography,
  Divider,
  List,
  Spin,
  Tooltip
} from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  DownloadOutlined,
  FileOutlined,
  FolderOpenOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import api from '../../api/axios';
import './UserManagement.css';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AssignmentView = ({ userId, userName, embedded = false }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [form] = Form.useForm();

  // File preview states
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [securePreviewUrl, setSecurePreviewUrl] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserAssignments();
    }
  }, [userId]);

  const fetchUserAssignments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/assignments/user/${userId}`);
      if (response.data.status === 200) {
        setAssignments(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      message.error('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (assignment) => {
    setSelectedAssignment(assignment);
    form.setFieldsValue({
      comments: assignment.adminReview?.comments || '',
      grade: assignment.adminReview?.grade || '',
      status: assignment.submissionStatus
    });
    setReviewModalVisible(true);
  };

  const handleSubmitReview = async (values) => {
    try {
      const response = await api.put(
        `/admin/assignments/${selectedAssignment._id}/review`,
        values
      );

      if (response.data.status === 200) {
        message.success('Review updated successfully');
        setReviewModalVisible(false);
        fetchUserAssignments();
      }
    } catch (error) {
      console.error('Error updating review:', error);
      message.error('Failed to update review');
    }
  };

  const handleFilePreview = async (file) => {
    setPreviewFile(file);
    setPreviewModalVisible(true);
    setPreviewLoading(true);
    setSecurePreviewUrl(null);

    try {
      const fileObject = {
        _id: file.fileId || file._id,
        name: file.fileName,
        url: file.fileUrl,
        type: file.fileType
      };

      const { data } = await api.post("/stream/generate-token", {
        fileId: fileObject._id,
      });

      let secureUrl;
      if (data.isDirectUrl) {
        secureUrl = data.signedUrl;
      } else {
        secureUrl = `${api.defaults.baseURL}/stream/${data.token}`;
      }

      setSecurePreviewUrl(secureUrl);

      const fileExtension = file.fileName.split('.').pop().toLowerCase();
      const isVideoFile = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(fileExtension);
      const isPdfFile = fileExtension === 'pdf';
      const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);

      if (!isVideoFile && !isPdfFile && !isImageFile) {
        window.open(secureUrl, '_blank');
        setPreviewModalVisible(false);
      }

    } catch (error) {
      console.error("Error generating preview URL:", error);
      message.error("Failed to load file preview");
      setPreviewModalVisible(false);
    } finally {
      setPreviewLoading(false);
    }
  };

  const closePreviewModal = () => {
    setPreviewFile(null);
    setPreviewModalVisible(false);
    setSecurePreviewUrl(null);
  };

  const handleViewInFolder = async (assignment) => {
    try {
      message.info(
        `Assignment files are stored in: Course Folder > Assignments > ${assignment.student?.firstName || 'Student'}_${assignment.student?.phone || 'Unknown'}. You can access them through the Content management section.`,
        8
      );
    } catch (error) {
      console.error('Error navigating to folder:', error);
      message.error('Failed to navigate to assignment folder');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      submitted: { color: 'blue', text: 'Submitted', icon: <ClockCircleOutlined /> },
      reviewed: { color: 'orange', text: 'Reviewed', icon: <SyncOutlined spin /> },
      graded: { color: 'success', text: 'Graded', icon: <CheckCircleOutlined /> }
    };

    const config = statusConfig[status] || statusConfig.submitted;
    return (
      <Tag icon={config.icon} color={config.color} style={{ padding: '4px 10px', fontSize: '13px' }}>
        {config.text.toUpperCase()}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'Assignment',
      dataIndex: 'assignmentTitle',
      key: 'assignmentTitle',
      render: (text) => <span className="text-white font-medium text-base">{text}</span>
    },
    {
      title: 'Course',
      dataIndex: ['courseRootFolder', 'name'],
      key: 'course',
      render: (text) => <span className="text-gray-400">{text || 'General'}</span>
    },
    {
      title: 'Submitted On',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => <span className="text-gray-300">{new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
    },
    {
      title: 'Files',
      dataIndex: 'submittedFiles',
      key: 'submittedFiles',
      render: (files) => (
        <Space>
          <Tag icon={<FileOutlined />} color="default" className="text-gray-300 border-gray-700 bg-transparent">
            {files?.length || 0} File(s)
          </Tag>
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'submissionStatus',
      key: 'submissionStatus',
      render: (status) => getStatusTag(status)
    },
    {
      title: 'Grade',
      dataIndex: ['adminReview', 'grade'],
      key: 'grade',
      render: (grade) => grade ? <Tag color="gold" className="font-bold text-sm px-2 text-black">{grade}</Tag> : <span className="text-gray-500">-</span>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Review Assignment">
            <Button
              type="primary"
              shape="circle"
              icon={<EditOutlined />}
              onClick={() => handleReview(record)}
              className="primary-btn"
            />
          </Tooltip>
          <Tooltip title="View Folder Location">
            <Button
              shape="circle"
              icon={<FolderOpenOutlined />}
              onClick={() => handleViewInFolder(record)}
              className="secondary-btn"
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <div className={embedded ? "assignment-embedded-container" : "user-management-container"}>
      {!embedded && (
        <div className="page-header">
          <div>
            <h1 className="page-title">📝 Assignment Submissions</h1>
            <p className="page-subtitle">Manage and grade assignments for <span style={{ color: '#3b82f6', fontWeight: 600 }}>{userName}</span></p>
          </div>
        </div>
      )}

      <div className="glass-card">
        <Table
          columns={columns}
          dataSource={assignments}
          loading={loading}
          rowKey="_id"
          pagination={{ pageSize: 8 }}
          className="dark-table"
        />
      </div>

      {/* Review Modal */}
      <Modal
        title={<span style={{ color: '#fff', fontSize: '18px' }}>Review: {selectedAssignment?.assignmentTitle}</span>}
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={800}
        className="dark-modal"
        destroyOnClose
        centered
      >
        {selectedAssignment && (
          <div style={{ color: '#d1d5db' }}>
            <div style={{ marginBottom: '24px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h4 style={{ color: '#3b82f6', marginBottom: '8px', fontWeight: 600 }}>Assignment Description</h4>
              <Paragraph style={{ color: '#d1d5db', marginBottom: '16px' }}>{selectedAssignment.assignmentDescription}</Paragraph>

              {selectedAssignment.studentNotes && (
                <>
                  <Divider style={{ borderColor: '#374151', margin: '12px 0' }} />
                  <h4 style={{ color: '#3b82f6', marginBottom: '8px', fontWeight: 600 }}>Student Notes</h4>
                  <Paragraph style={{ color: '#d1d5db', fontStyle: 'italic' }}>"{selectedAssignment.studentNotes}"</Paragraph>
                </>
              )}
            </div>

            <h4 style={{ color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileOutlined /> Submitted Files
            </h4>
            <List
              style={{ marginBottom: '24px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
              itemLayout="horizontal"
              dataSource={selectedAssignment.submittedFiles}
              renderItem={(file) => (
                <List.Item style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <FileOutlined style={{ color: '#3b82f6', fontSize: '20px' }} />
                      <div>
                        <Text style={{ color: '#fff', display: 'block' }}>{file.fileName}</Text>
                        <Text style={{ color: '#6b7280', fontSize: '12px', textTransform: 'uppercase' }}>{file.fileType}</Text>
                      </div>
                    </div>
                    <Space>
                      <Button
                        size="small"
                        type="primary"
                        ghost
                        icon={<EyeOutlined />}
                        onClick={() => handleFilePreview(file)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        icon={<DownloadOutlined />}
                        className="secondary-btn"
                        style={{ height: '24px', padding: '0 7px', fontSize: '12px' }}
                        onClick={() => {
                          const url = file.fileUrl.startsWith('http')
                            ? file.fileUrl
                            : `${api.defaults.baseURL}${file.fileUrl}`;
                          window.open(url, '_blank');
                        }}
                      >
                        Download
                      </Button>
                    </Space>
                  </div>
                </List.Item>
              )}
            />

            <Divider style={{ borderColor: '#374151' }} />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitReview}
              style={{ marginTop: '16px' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Form.Item
                  name="status"
                  label={<span className="dark-label">Submission Status</span>}
                  rules={[{ required: true }]}
                >
                  <Select className="dark-select" dropdownClassName="dark-dropdown">
                    <Option value="submitted">Submitted</Option>
                    <Option value="reviewed">Reviewed</Option>
                    <Option value="graded">Graded</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="grade"
                  label={<span className="dark-label">Grade (Optional)</span>}
                >
                  <Input className="dark-input" placeholder="e.g. A, 90/100" />
                </Form.Item>
              </div>

              <Form.Item
                name="comments"
                label={<span className="dark-label">Instructor Feedback</span>}
              >
                <TextArea
                  rows={4}
                  className="dark-input"
                  placeholder="Enter detailed feedback for the student..."
                  style={{ resize: 'none' }}
                />
              </Form.Item>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '8px' }}>
                <Button className="secondary-btn" onClick={() => setReviewModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" className="primary-btn">
                  Update Review
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Modal>

      {/* File Preview Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>Preview: {previewFile?.fileName}</span>}
        visible={previewModalVisible}
        onCancel={closePreviewModal}
        footer={null}
        width={900}
        centered
        className="dark-modal"
        bodyStyle={{ padding: 0, backgroundColor: '#000', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        {previewLoading ? (
          <div style={{ textAlign: 'center', padding: '48px' }}>
            <Spin size="large" />
            <p style={{ marginTop: '16px', color: '#9ca3af' }}>Securely loading file...</p>
          </div>
        ) : previewFile && securePreviewUrl ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', overflow: 'hidden' }}>
            {(() => {
              const fileExtension = previewFile.fileName.split('.').pop().toLowerCase();
              const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
              const isPdfFile = fileExtension === 'pdf';
              const isVideoFile = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(fileExtension);

              if (isImageFile) {
                return (
                  <img
                    src={securePreviewUrl}
                    alt={previewFile.fileName}
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }}
                  />
                );
              } else if (isPdfFile) {
                return (
                  <iframe
                    src={`${securePreviewUrl}#toolbar=0`}
                    style={{ width: '100%', height: '80vh', border: 'none' }}
                    title={previewFile.fileName}
                  />
                );
              } else if (isVideoFile) {
                return (
                  <video
                    src={securePreviewUrl}
                    controls
                    style={{ width: '100%', maxHeight: '80vh' }}
                    controlsList="nodownload"
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              } else {
                return (
                  <div style={{ padding: '48px', textAlign: 'center' }}>
                    <FileOutlined style={{ fontSize: '64px', color: '#555' }} />
                    <p style={{ marginTop: '24px', color: '#9ca3af', fontSize: '18px' }}>Preview not available for this file type</p>
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      className="primary-btn"
                      style={{ marginTop: '16px' }}
                      onClick={() => window.open(securePreviewUrl, '_blank')}
                    >
                      Download File
                    </Button>
                  </div>
                );
              }
            })()}
          </div>
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            Failed to load preview. Please try again.
          </div>
        )}
      </Modal>
    </div>
  );
};

export { AssignmentView };
