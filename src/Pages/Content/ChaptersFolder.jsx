import { ArrowLeftOutlined, FolderOutlined, MoreOutlined, PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Dropdown, Form, Input, Menu, Modal, Spin } from 'antd';
import React, { useEffect, useState, memo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import HOC from '../../Component/HOC/HOC';
import { createChapter, deleteChapterById, getSubjectById, updateChapterById } from '../../redux/slices/courseSlice';

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
    margin: '0 0 24px',
    fontSize: '24px',
    fontWeight: '700',
    color: '#ffffff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '20px',
  },
  card: {
    background: '#171717',
    borderRadius: '16px',
    border: '1px solid #262626',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    position: 'relative',
  },
  cardName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    marginTop: '12px',
  },
  menuBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    color: '#888',
    fontSize: '18px',
    cursor: 'pointer',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '48px',
    color: '#888',
    fontSize: '14px',
  },
};

// Chapter Card Component
const ChapterCard = memo(({ chapter, isEditing, editName, onEditChange, onSaveEdit, onRename, onDelete, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<SaveOutlined />} onClick={(e) => {
        e.domEvent?.stopPropagation();
        onRename(chapter);
      }}>
        Rename
      </Menu.Item>
      <Menu.Item key="2" icon={<DeleteOutlined />} danger onClick={(e) => {
        e.domEvent?.stopPropagation();
        onDelete(chapter._id);
      }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hovered ? '#22c55e40' : '#262626',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      onClick={() => onClick(chapter._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FolderOutlined style={{ fontSize: '48px', color: '#22c55e' }} />

      {isEditing ? (
        <div
          style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'center' }}
          onClick={e => e.stopPropagation()}
        >
          <Input
            value={editName}
            onChange={(e) => onEditChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            size="small"
            style={{ width: '70%' }}
          />
          <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onSaveEdit(chapter._id);
            }}
          />
        </div>
      ) : (
        <div style={styles.cardName}>{chapter.name}</div>
      )}

      <Dropdown overlay={menu} trigger={['click']} placement="bottomRight">
        <MoreOutlined
          style={styles.menuBtn}
          onClick={(e) => e.stopPropagation()}
        />
      </Dropdown>
    </div>
  );
});

const ChaptersFolder = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { selectedSubject, loading } = useSelector((state) => state.courses);
  const navigate = useNavigate();

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editingChapterName, setEditingChapterName] = useState('');
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getSubjectById(id));
  }, [dispatch, id]);

  const handleAddChapter = useCallback(async (values) => {
    const chapterData = { ...values, subjectId: id };
    try {
      await dispatch(createChapter(chapterData)).unwrap();
      toast.success('Chapter added successfully');
      setIsModalVisible(false);
      form.resetFields();
      dispatch(getSubjectById(id));
    } catch (error) {
      toast.error('Failed to add chapter');
    }
  }, [dispatch, id, form]);

  const handleRename = useCallback((chapter) => {
    setEditingChapterId(chapter._id);
    setEditingChapterName(chapter.name);
  }, []);

  const handleSaveEdit = useCallback(async (chapterId) => {
    try {
      await dispatch(
        updateChapterById({
          subjectId: id,
          chapterId,
          updatedData: { name: editingChapterName },
        })
      ).unwrap();
      toast.success('Chapter updated');
      setEditingChapterId(null);
      dispatch(getSubjectById(id));
    } catch (error) {
      toast.error('Failed to update');
    }
  }, [dispatch, id, editingChapterName]);

  const handleDelete = useCallback(async (chapterId) => {
    try {
      await dispatch(deleteChapterById({ subjectId: id, chapterId })).unwrap();
      toast.success('Chapter deleted');
      dispatch(getSubjectById(id));
    } catch (error) {
      toast.error('Failed to delete');
    }
  }, [dispatch, id]);

  const handleCardClick = useCallback((chapterId) => {
    if (!editingChapterId) {
      navigate(`/content/subjects/${id}/chapters/${chapterId}`);
    }
  }, [navigate, id, editingChapterId]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => window.history.back()}>
          Back
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Chapter
        </Button>
      </div>

      <h1 style={styles.title}>📖 Chapters for {selectedSubject?.name}</h1>

      {/* Chapter Grid */}
      <div style={styles.grid}>
        {selectedSubject?.chapters?.length > 0 ? (
          selectedSubject.chapters.map((chapter) => (
            <ChapterCard
              key={chapter._id}
              chapter={chapter}
              isEditing={editingChapterId === chapter._id}
              editName={editingChapterName}
              onEditChange={setEditingChapterName}
              onSaveEdit={handleSaveEdit}
              onRename={handleRename}
              onDelete={handleDelete}
              onClick={handleCardClick}
            />
          ))
        ) : (
          <div style={styles.emptyState}>No chapters found for this subject.</div>
        )}
      </div>

      {/* Add Chapter Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>Add Chapter</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddChapter}>
          <Form.Item
            name="name"
            label={<span style={{ color: '#d4d4d4' }}>Chapter Name</span>}
            rules={[{ required: true, message: 'Please enter the chapter name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span style={{ color: '#d4d4d4' }}>Description</span>}
            rules={[{ required: true, message: 'Please enter the description' }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Add Chapter
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(ChaptersFolder);
