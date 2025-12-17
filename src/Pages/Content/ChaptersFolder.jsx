import { ArrowLeftOutlined, FolderOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Form, Input, Menu, Modal, Spin, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { FaSave } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import HOC from '../../Component/HOC/HOC';
import { createChapter, deleteChapterById, getSubjectById, updateChapterById } from '../../redux/slices/courseSlice';

const { Title, Paragraph } = Typography;

const ChaptersFolder = () => {
  const dispatch = useDispatch();
  const { id } = useParams(); // Get subjectId from URL params
  const { selectedSubject, loading } = useSelector((state) => state.courses);
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterName, setEditingChapterName] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getSubjectById(id)); // Fetch subject and its chapters
  }, [dispatch, id]);

  const handleAddChapter = (values) => {
    const chapterData = { ...values, subjectId: id };
    dispatch(createChapter(chapterData))
      .then(() => {
        toast.success('Chapter added successfully');
        setIsModalVisible(false);
        dispatch(getSubjectById(id)); // Refresh the subject data
      })
      .catch((error) => {
        console.error('Failed to add chapter:', error);
        toast.error('Failed to add chapter');
      });
  };

  const handleEditClick = (e, chapter) => {
    // e.stopPropagation(); // Prevent navigation when edit icon is clicked
    setEditingChapterId(chapter._id);
    setEditingChapterName(chapter.name);
  };

  const handleSaveEdit = async (e, chapter) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation(); // Prevent navigation when save icon is clicked
    }
    try {
      const updatedData = { name: editingChapterName };
      await dispatch(
        updateChapterById({
          subjectId: id,
          chapterId: chapter._id, // Use chapter ID for updates
          updatedData,
        })
      ).unwrap();
      toast.success('Chapter name updated successfully');
      setEditingChapterId(null); // Exit edit mode
      dispatch(getSubjectById(id)); // Refresh chapters list
    } catch (error) {
      toast.error('Failed to update chapter name');
      console.error('Failed to update chapter:', error);
    }
  };

  const handleDeleteChapter = async (e, chapterId) => {
    // e.stopPropagation(); // Prevent navigation when delete icon is clicked
    try {
      await dispatch(deleteChapterById({ subjectId: id, chapterId })).unwrap();
      toast.success('Chapter deleted successfully');
      dispatch(getSubjectById(id)); // Refresh the chapters list
    } catch (error) {
      toast.error('Failed to delete chapter');
      console.error('Failed to delete chapter:', error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><Spin size="large" /></div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>Back</Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>Add Chapter</Button>
      </div>

      <Title className="text-white" level={2}>Chapters for {selectedSubject?.name}</Title>

      <div className="grid grid-cols-3 gap-4">
        {selectedSubject?.chapters?.length > 0 ? (
          selectedSubject.chapters.map((chapter) => (
            <Card
              key={chapter._id}
              className="flex flex-col items-center justify-center"
              hoverable
              style={{ cursor: 'pointer', textAlign: 'center' }}
              onClick={() => navigate(`/content/subjects/${id}/chapters/${chapter._id}`)}
            >
              <FolderOutlined style={{ fontSize: '64px', color: '#000000' }} />
              {editingChapterId === chapter._id ? (
                <div className="flex flex-col items-center">
                  <Input
                    value={editingChapterName}
                    onChange={(e) => setEditingChapterName(e.target.value)}
                    onClick={(e) => {
                      if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                      }
                    }}
                    placeholder="Chapter Name"
                    style={{ marginBottom: '8px' }}
                  />
                  <FaSave
                    className="text-green-500 cursor-pointer"
                    onClick={(e) => handleSaveEdit(e, chapter)}
                  />
                </div>
              ) : (
                <div onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                }} className="flex items-center justify-between w-full">
                  <Title level={4} style={{ margin: 0 }}>{chapter.name}</Title>
                  <Dropdown
                  className='absolute right-0 top-0 p-2'
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="1"
                          onClick={(e) => handleEditClick(e, chapter)}
                        >
                          Rename
                        </Menu.Item>
                        <Menu.Item
                          key="2"
                          onClick={(e) => handleDeleteChapter(e, chapter._id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["click"]}
                  >
                    <MoreOutlined
                      style={{ fontSize: "24px", cursor: "pointer" }}
                      onClick={(e) => {
                      if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                      }
                    }} // Prevent card navigation on dropdown click
                    />
                  </Dropdown>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Paragraph>No chapters found for this subject.</Paragraph>
        )}
      </div>

      {/* Modal for adding a chapter */}
      <Modal
        title="Add Chapter"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddChapter}
        >
          <Form.Item
            name="name"
            label="Chapter Name"
            rules={[{ required: true, message: 'Please enter the chapter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          {/* <Form.Item
            name="url"
            label="URL"
            rules={[{ required: true, message: 'Please enter the chapter URL' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duration"
          >
            <Input />
          </Form.Item> */}
          <Form.Item>
            <Button type="primary" htmlType="submit">Add Chapter</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ChaptersFolder);
