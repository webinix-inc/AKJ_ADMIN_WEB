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
  Spin
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DownloadOutlined,
  FileOutlined,
  FolderOpenOutlined
} from '@ant-design/icons';
import api from '../../api/axios';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const AssignmentView = ({ userId, userName }) => {
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
    console.log('🔍 [DEBUG] Previewing assignment file:', file);
    
    setPreviewFile(file);
    setPreviewModalVisible(true);
    setPreviewLoading(true);
    setSecurePreviewUrl(null);

    try {
      // Create a file object that matches the expected format for the streaming system
      const fileObject = {
        _id: file.fileId || file._id, // Use fileId if available, fallback to _id
        name: file.fileName,
        url: file.fileUrl,
        type: file.fileType
      };

      // Generate secure token for the file using the streaming system
      const { data } = await api.post("/stream/generate-token", {
        fileId: fileObject._id,
      });

      let secureUrl;
      if (data.isDirectUrl) {
        secureUrl = data.signedUrl;
      } else {
        secureUrl = `${api.defaults.baseURL}/stream/${data.token}`;
      }

      console.log('🔍 [DEBUG] Generated secure URL:', secureUrl);
      setSecurePreviewUrl(secureUrl);

      const fileExtension = file.fileName.split('.').pop().toLowerCase();
      const isVideoFile = ['mp4', 'webm', 'mkv', 'avi', 'mov'].includes(fileExtension);
      const isPdfFile = fileExtension === 'pdf';
      const isImageFile = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExtension);
      
      // For non-previewable files, open in new tab
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
      // Navigate to the assignment folder in the content management system
      // The assignment files are stored in: Course Root Folder > Assignments > StudentName_Phone
      
      // We need to find the assignment folder ID
      // For now, we'll show a message with instructions
      message.info(
        `Assignment files are stored in: Course Folder > Assignments > ${assignment.student?.firstName || 'Student'}_${assignment.student?.phone || 'Unknown'}. You can access them through the Content management section.`,
        8
      );
      
      // TODO: In the future, we could implement direct navigation to the folder
      // by finding the folder ID and redirecting to /admin/content/folder/{folderId}
      
    } catch (error) {
      console.error('Error navigating to folder:', error);
      message.error('Failed to navigate to assignment folder');
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      submitted: { color: 'blue', text: 'Submitted' },
      reviewed: { color: 'orange', text: 'Reviewed' },
      graded: { color: 'green', text: 'Graded' }
    };
    
    const config = statusConfig[status] || statusConfig.submitted;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Assignment Title',
      dataIndex: 'assignmentTitle',
      key: 'assignmentTitle',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Course',
      dataIndex: ['courseRootFolder', 'name'],
      key: 'course',
      render: (text) => text || 'Course Folder'
    },
    {
      title: 'Submitted Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Files',
      dataIndex: 'submittedFiles',
      key: 'submittedFiles',
      render: (files) => (
        <Space>
          <FileOutlined />
          <Text>{files.length} file(s)</Text>
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
      render: (grade) => grade ? <Tag color="gold">{grade}</Tag> : '-'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EyeOutlined />} 
            onClick={() => handleReview(record)}
            size="small"
          >
            Review
          </Button>
          <Button 
            icon={<FolderOpenOutlined />} 
            onClick={() => handleViewInFolder(record)}
            size="small"
            type="dashed"
          >
            View Folder
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card title={`📝 Assignment Submissions - ${userName}`}>
      <Table
        columns={columns}
        dataSource={assignments}
        loading={loading}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Review Modal */}
      <Modal
        title={`Review Assignment: ${selectedAssignment?.assignmentTitle}`}
        visible={reviewModalVisible}
        onCancel={() => setReviewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedAssignment && (
          <div>
            <div className="mb-4">
              <Title level={5}>Assignment Details</Title>
              <Paragraph>{selectedAssignment.assignmentDescription}</Paragraph>
              
              {selectedAssignment.studentNotes && (
                <>
                  <Text strong>Student Notes:</Text>
                  <Paragraph>{selectedAssignment.studentNotes}</Paragraph>
                </>
              )}
              
              <Text strong>Submitted Files:</Text>
              <List
                size="small"
                dataSource={selectedAssignment.submittedFiles}
                renderItem={(file) => (
                  <List.Item>
                    <Space>
                      <FileOutlined />
                      <Text>{file.fileName}</Text>
                      <Tag>{file.fileType}</Tag>
                      <Button 
                        size="small" 
                        icon={<EyeOutlined />}
                        onClick={() => handleFilePreview(file)}
                      >
                        Preview
                      </Button>
                      <Button 
                        size="small" 
                        icon={<DownloadOutlined />}
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
                  </List.Item>
                )}
              />
            </div>

            <Divider />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmitReview}
            >
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true }]}
              >
                <Select>
                  <Option value="submitted">Submitted</Option>
                  <Option value="reviewed">Reviewed</Option>
                  <Option value="graded">Graded</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="grade"
                label="Grade"
              >
                <Input placeholder="Enter grade (optional)" />
              </Form.Item>

              <Form.Item
                name="comments"
                label="Comments"
              >
                <TextArea 
                  rows={4} 
                  placeholder="Enter your feedback for the student"
                />
              </Form.Item>

              <Form.Item className="mb-0">
                <Space className="w-full justify-end">
                  <Button onClick={() => setReviewModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Update Review
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>

      {/* File Preview Modal */}
      <Modal
        title={`Preview: ${previewFile?.fileName}`}
        visible={previewModalVisible}
        onCancel={closePreviewModal}
        footer={null}
        width={800}
        centered
      >
        {previewLoading ? (
          <div className="text-center py-12">
            <Spin size="large" />
            <p className="mt-4">Loading file preview...</p>
          </div>
        ) : previewFile && securePreviewUrl ? (
          <div className="text-center">
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
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                    onError={(e) => {
                      console.error('Image load error:', e);
                      message.error('Failed to load image');
                    }}
                  />
                );
              } else if (isPdfFile) {
                return (
                  <iframe
                    src={securePreviewUrl}
                    width="100%"
                    height="500px"
                    style={{ border: 'none' }}
                    title={previewFile.fileName}
                  />
                );
              } else if (isVideoFile) {
                return (
                  <video
                    src={securePreviewUrl}
                    controls
                    style={{ maxWidth: '100%', maxHeight: '500px' }}
                    onError={(e) => {
                      console.error('Video load error:', e);
                      message.error('Failed to load video');
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              } else {
                return (
                  <div className="py-12">
                    <FileOutlined style={{ fontSize: '48px', color: '#ccc' }} />
                    <p className="mt-4">Preview not available for this file type</p>
                    <Button 
                      type="primary" 
                      icon={<DownloadOutlined />}
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
          <div className="text-center py-12">
            <p>Failed to load file preview</p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AssignmentView;
