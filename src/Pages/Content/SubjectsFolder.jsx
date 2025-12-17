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
  Card,
  Dropdown,
  Form,
  Input,
  Menu,
  Modal,
  Select,
  Spin,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
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

const { Title, Paragraph } = Typography;
const { Option } = Select;

const SubjectsFolder = () => {
  const dispatch = useDispatch();
  const { id } = useParams();
  const { course, loading } = useSelector((state) => state.courses);
  const { courses } = useSelector((state) => state.courses);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const [editingSubject, setEditingSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState("");

  useEffect(() => {
    dispatch(fetchCourseById(id));
    dispatch(fetchCourses());
  }, [dispatch, id]);

  const handleAddSubject = async (values) => {
    try {
      await dispatch(createSubject(values)).unwrap();
      toast.success("Subject added successfully");
      setIsModalVisible(false);
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to add subject");
      console.error("Failed to add subject:", error);
    }
  };

  const handleRenameSubject = (event, subject) => {
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    setEditingSubject(subject._id);
    setNewSubjectName(subject.name);
  };

  const handleCardClick = (e, id) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    navigate(`/content/subjects/${id}/chapters`);
  };

  const handleSaveEdit = async (e,subjectId) => {
    try {
      await dispatch(
        updateSubjectById({
          id: subjectId,
          updatedData: { name: newSubjectName },
        })
      ).unwrap();
      toast.success("Subject name updated successfully");
      setEditingSubject(null);
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to update subject name");
      console.error("Failed to update subject name:", error);
    }
  };

  const handleDeleteSubject = async (e,subjectId) => {
    try {
      await dispatch(deleteSubjectById(subjectId)).unwrap();
      toast.success("Subject deleted successfully");
      dispatch(fetchCourseById(id));
    } catch (error) {
      toast.error(error.message || "Failed to delete subject");
      console.error("Failed to delete subject:", error);
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
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
      <div className="flex justify-between items-center mb-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => window.history.back()}
        >
          Back
        </Button>
        <Button type="primary" icon={<PlusOutlined />} onClick={showModal}>
          Add Subject
        </Button>
      </div>

      <Title className="text-white" level={2}>
        Subjects for {course?.title}
      </Title>

      <div className="grid grid-cols-3 gap-4">
        {course?.subjects?.length > 0 ? (
          course.subjects.map((subject) => (
            <Card
              key={subject._id}
              className="flex flex-col items-center justify-center"
              hoverable
              onClick={(e) => handleCardClick(e, subject._id)}
              style={{ cursor: "pointer", textAlign: "center" }}
            >
              <FolderOutlined style={{ fontSize: "64px", color: "#000000" }} />

              {editingSubject === subject._id ? (
                <div onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                }} className="flex items-center">
                  <Input
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    onClick={(e) => {
                      if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                      }
                    }} // Stops card click during edit
                    style={{ marginRight: "8px", width: "70%" }}
                  />
                  <Button
                    icon={<SaveOutlined />}
                    onClick={(e) => handleSaveEdit(e,subject._id)}
                  />
                </div>
              ) : (
                <div onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                }} className="flex items-center justify-between w-full">
                  <Title level={4}>{subject.name}</Title>
                  <Dropdown
                  className="absolute right-0 top-0 p-2"
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="1"
                          icon={<SaveOutlined />}
                          onClick={(e) => handleRenameSubject(e, subject)}
                        >
                          Rename
                        </Menu.Item>
                        <Menu.Item
                          key="2"
                          icon={<DeleteOutlined />}
                          onClick={(e) => handleDeleteSubject(e,subject._id)}
                        >
                          Delete
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={["click"]}
                    onClick={(e) => {
                      if (e && typeof e.stopPropagation === 'function') {
                        e.stopPropagation();
                      }
                    }}
                  >
                    <MoreOutlined
                      style={{ fontSize: "24px", cursor: "pointer" }}
                      onClick={(e) => {
                        if (e && typeof e.stopPropagation === 'function') {
                          e.stopPropagation();
                        }
                      }} // Prevent card navigation on dropdown icon click
                    />
                  </Dropdown>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Paragraph>No subjects found for this course.</Paragraph>
        )}
      </div>

      <Modal
        title="Add Subject"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddSubject}>
          <Form.Item
            name="name"
            label="Subject Name"
            rules={[{ required: true, message: "Please enter the subject name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter the description" }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="professor" label="Professor">
            <Input />
          </Form.Item>
          {/* <Form.Item name="duration" label="Duration">
            <Input />
          </Form.Item> */}
          <Form.Item
            name="courseId"
            label="Select Course"
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
            <Button type="primary" htmlType="submit">
              Add Subject
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default HOC(SubjectsFolder);
