import {
  ArrowLeftOutlined,
  DeleteOutlined,
  FolderOutlined,
  MoreOutlined,
  PlusOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Select,
  Spin,
} from "antd";
import React, { useEffect, useState, memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import HOC from "../../Component/HOC/HOC";
import {
  createSubject,
  deleteSubjectById,
  fetchCourseById,
  fetchCourses,
  updateSubjectById,
} from "../../redux/slices/courseSlice";

import "./Content.css";

const { Option } = Select;

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
  skeleton: {
    background: '#262626',
    borderRadius: '16px',
    height: '150px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '48px',
    color: '#888',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '300px',
  },
};

// Subject Card Component
const SubjectCard = memo(({ subject, isEditing, editName, onEditChange, onSaveEdit, onRename, onDelete, onClick }) => {
  const [hovered, setHovered] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<SaveOutlined />} onClick={(e) => {
        e.domEvent?.stopPropagation();
        onRename(subject);
      }}>
        Rename
      </Menu.Item>
      <Menu.Item key="2" icon={<DeleteOutlined />} danger onClick={(e) => {
        e.domEvent?.stopPropagation();
        onDelete(subject._id);
      }}>
        Delete
      </Menu.Item>
    </Menu>
  );

  return (
    <div
      style={{
        ...styles.card,
        borderColor: hovered ? '#3b82f640' : '#262626',
        transform: hovered ? 'translateY(-4px)' : 'none',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.4)' : 'none',
      }}
      onClick={() => onClick(subject._id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <FolderOutlined style={{ fontSize: '48px', color: '#3b82f6' }} />

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
              onSaveEdit(subject._id);
            }}
          />
        </div>
      ) : (
        <div style={styles.cardName}>{subject.name}</div>
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

const SubjectsFolder = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { course, loading, courses } = useSelector((state) => state.courses);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  useEffect(() => {
    dispatch(fetchCourseById(id));
    dispatch(fetchCourses());
  }, [dispatch, id]);

  const handleAddSubject = useCallback(async (values) => {
    try {
      await dispatch(createSubject(values)).unwrap();
      toast.success("Subject added successfully");
      setIsModalVisible(false);
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
    }
  }, [dispatch, id]);

  const handleRenameSubject = useCallback((subject) => {
    setEditingSubject(subject._id);
    setNewSubjectName(subject.name);
  }, []);

  const handleCardClick = useCallback((subjectId) => {
    if (!editingSubject) {
      navigate(`/content/subjects/${subjectId}/chapters`);
    }
  }, [navigate, editingSubject]);

  const handleSaveEdit = useCallback(async (subjectId) => {
    try {
      await dispatch(
        updateSubjectById({
          id: subjectId,
          updatedData: { name: newSubjectName },
        })
      ).unwrap();
      toast.success("Subject name updated");
      setEditingSubject(null);
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to update");
    }
  }, [dispatch, id, newSubjectName]);

  const handleDeleteSubject = useCallback(async (subjectId) => {
    try {
      await dispatch(deleteSubjectById(subjectId)).unwrap();
      toast.success("Subject deleted");
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to delete");
    }
  }, [dispatch, id]);

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
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
          Add Subject
        </Button>
      </div>

      <h1 style={styles.title}>📚 Subjects for {course?.title}</h1>

      {/* Subject Grid */}
      <div style={styles.grid}>
        {course?.subjects?.length > 0 ? (
          course.subjects.map((subject) => (
            <SubjectCard
              key={subject._id}
              subject={subject}
              isEditing={editingSubject === subject._id}
              editName={newSubjectName}
              onEditChange={setNewSubjectName}
              onSaveEdit={handleSaveEdit}
              onRename={handleRenameSubject}
              onDelete={handleDeleteSubject}
              onClick={handleCardClick}
            />
          ))
        ) : (
          <div style={styles.emptyState}>No subjects found for this course.</div>
        )}
      </div>

      {/* Add Subject Modal */}
      <Modal
        title={<span style={{ color: '#fff' }}>Add Subject</span>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubject}>
          <Form.Item
            name="name"
            label={<span style={{ color: '#d4d4d4' }}>Subject Name</span>}
            rules={[{ required: true, message: "Please enter the subject name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label={<span style={{ color: '#d4d4d4' }}>Description</span>}
            rules={[{ required: true, message: "Please enter the description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="professor" label={<span style={{ color: '#d4d4d4' }}>Professor</span>}>
            <Input />
          </Form.Item>
          <Form.Item
            name="courseId"
            label={<span style={{ color: '#d4d4d4' }}>Select Course</span>}
            rules={[{ required: true, message: "Please select the course" }]}
          >
            <Select placeholder="Select a course">
              {courses.map((course) => (
                <Option key={course._id} value={course._id}>
                  {course.title}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Add Subject
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(SubjectsFolder);
