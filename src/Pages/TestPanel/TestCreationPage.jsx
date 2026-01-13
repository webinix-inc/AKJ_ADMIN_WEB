import {
  ArrowLeftOutlined,
  BookOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  SearchOutlined,
  FilterOutlined
} from "@ant-design/icons";
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Spin,
  Switch,
  Table,
} from "antd";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import LoadingSpinner from "../../Components/Common/LoadingSpinner";
import "./TestPanel.css"; // Import the new dark theme styles

const { Option } = Select;

const TestCreationPage = () => {
  const { id } = useParams();
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showOnlyActive, setShowOnlyActive] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizForm] = Form.useForm();
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [quizAvailability, setQuizAvailability] = useState({});
  const [availabilityModalVisible, setAvailabilityModalVisible] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptModalVisible, setAttemptModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/folder/${id}`);
      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to fetch quizzes");
      }
      const quizzesData = response.data.quizzes || [];
      setQuizzes(quizzesData);
      setFilteredQuizzes(quizzesData);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch quizzes";
      setError(errorMsg);
      message.error(errorMsg);
      setQuizzes([]);
      setFilteredQuizzes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id && id !== 'undefined' && id !== 'null') {
      fetchQuizzes();
    } else {
      message.error("Invalid folder ID. Please navigate from the test panel.");
      navigate(-1);
    }
  }, [id, navigate]);

  // Fetch quiz availability
  const fetchQuizAvailability = async (quizId) => {
    try {
      setLoading(true);
      const response = await api.get(`/quizzes/${quizId}/availability`);
      setQuizAvailability((prev) => ({
        ...prev,
        [quizId]: response.data.availability || {},
      }));
      setSelectedQuiz(quizId);
      setAvailabilityModalVisible(true);
    } catch (error) {
      console.error("Error fetching quiz availability:", error);
      message.error("Failed to fetch quiz availability.");
    } finally {
      setLoading(false);
    }
  };

  // Update quiz availability
  const updateQuizAvailability = async (quizId, payload) => {
    try {
      setLoading(true);
      const response = await api.patch(
        `/admin/quizzes/${quizId}/availability`,
        payload
      );
      const updatedAvailability = response.data.updatedAvailability || {};
      setQuizAvailability((prev) => ({
        ...prev,
        [quizId]: updatedAvailability,
      }));
      setQuizzes((prev) =>
        prev.map((quiz) =>
          quiz._id === quizId
            ? { ...quiz, isActive: updatedAvailability.isActive }
            : quiz
        )
      );
      setFilteredQuizzes((prev) =>
        prev.map((quiz) =>
          quiz._id === quizId
            ? { ...quiz, isActive: updatedAvailability.isActive }
            : quiz
        )
      );
      message.success("Quiz availability updated successfully.");
      setAvailabilityModalVisible(false);
      setSelectedQuiz(null);
    } catch (error) {
      console.error("Error updating quiz availability:", error);
      message.error("Failed to update quiz availability.");
    } finally {
      setLoading(false);
    }
  };

  // Delete quiz
  const handleDeleteQuiz = async (quizId) => {
    try {
      setLoading(true);
      await api.delete(`/admin/quizzes/${quizId}`);
      message.success("Quiz deleted successfully.");
      fetchQuizzes();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      message.error("Failed to delete quiz.");
    } finally {
      setLoading(false);
    }
  };

  // Create or update quiz
  const handleQuizSubmit = async (values) => {
    try {
      setLoading(true);
      const durationInMinutes = values.duration || 0;
      const requestBody = {
        quizName: values.quizName,
        duration: {
          hours: Math.floor(durationInMinutes / 60),
          minutes: durationInMinutes % 60,
        },
        category: values.category,
        isFreeTest: values.isFreeTest || false,
      };

      if (editingQuiz) {
        const response = await api.put(`/admin/quizzes/${editingQuiz._id}`, requestBody);
        if (response.data.success === false) throw new Error(response.data.message || "Failed to update quiz");
        message.success("Quiz updated successfully.");
      } else {
        const response = await api.post(`/admin/quizzes/${id}`, requestBody);
        if (response.data.success === false) throw new Error(response.data.message || "Failed to create quiz");
        message.success("Quiz created successfully.");
      }
      setIsModalVisible(false);
      quizForm.resetFields();
      setEditingQuiz(null);
      setTimeout(() => {
        fetchQuizzes();
      }, 500);
    } catch (error) {
      console.error("Error creating/updating quiz:", error);
      const errorMsg = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to save quiz";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Set quiz attempts
  const handleSetQuizAttempts = async (values) => {
    try {
      const { maxAttempts } = values;
      if (!selectedQuiz) return;
      setLoading(true);
      await api.patch(`/admin/quizzes/${selectedQuiz}/attempts`, { maxAttempts });
      message.success("Quiz attempts updated successfully.");
      fetchQuizzes();
      setAttemptModalVisible(false);
      setSelectedQuiz(null);
    } catch (error) {
      console.error("Error setting quiz attempts:", error);
      message.error("Failed to set quiz attempts.");
    } finally {
      setLoading(false);
    }
  };

  // Toggle quiz active status
  const toggleQuizActive = async (quizId, isActive) => {
    try {
      setLoading(true);
      await api.put(`/admin/quizzes/${quizId}/toggle-active`, { isActive });
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz._id === quizId ? { ...quiz, isActive } : quiz))
      );
      setFilteredQuizzes((prev) =>
        prev.map((quiz) => (quiz._id === quizId ? { ...quiz, isActive } : quiz))
      );
      message.success(`Quiz ${isActive ? "activated" : "deactivated"} successfully.`);
    } catch (error) {
      console.error("Error toggling quiz status:", error);
      message.error("Failed to toggle quiz status.");
    } finally {
      setLoading(false);
    }
  };

  // Filter quizzes
  const applyFilters = () => {
    let filtered = [...quizzes];
    if (searchText) {
      filtered = filtered.filter((quiz) =>
        quiz.quizName.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (selectedCategory) {
      filtered = filtered.filter((quiz) => quiz.category === selectedCategory);
    }
    if (showOnlyActive) {
      filtered = filtered.filter((quiz) => quiz.isActive);
    }
    setFilteredQuizzes(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [quizzes, searchText, selectedCategory, showOnlyActive]);

  const columns = [
    {
      title: "Quiz Name",
      dataIndex: "quizName",
      key: "quizName",
      width: "25%",
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
            <BookOutlined />
          </div>
          <span
            className="font-medium cursor-pointer hover:text-blue-500 transition-colors"
            onClick={() => navigate(`/test-details/${record._id}`)}
          >
            {text}
          </span>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "15%",
      render: (text) => (
        <span className="px-3 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-medium border border-gray-700">
          {text}
        </span>
      )
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: "15%",
      render: (duration) => {
        const { hours = 0, minutes = 0 } = duration || {};
        return <span className="text-gray-400">{hours}h {minutes}m</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "15%",
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => toggleQuizActive(record._id, checked)}
          size="small"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            className="text-gray-400 hover:text-blue-500"
            onClick={() => {
              setEditingQuiz(record);
              quizForm.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            className="text-gray-400 hover:text-purple-500"
            onClick={() => {
              setSelectedQuiz(record._id);
              setAttemptModalVisible(true);
            }}
          >
            Attempts
          </Button>
          <Button
            type="text"
            icon={<ClockCircleOutlined />}
            className="text-gray-400 hover:text-orange-500"
            onClick={() => fetchQuizAvailability(record._id)}
          >
            Avail
          </Button>
          <Popconfirm
            title="Delete this quiz?"
            description="This action cannot be undone."
            onConfirm={() => handleDeleteQuiz(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (loading && quizzes.length === 0) {
    return (
      <div className="test-panel-container flex items-center justify-center">
        <LoadingSpinner size="large" tip="Loading quizzes..." />
      </div>
    );
  }

  if (error && quizzes.length === 0) {
    return (
      <div className="test-panel-container flex items-center justify-center">
        <Result
          status="error"
          title={<span className="text-white">Failed to Load Quizzes</span>}
          subTitle={<span className="text-gray-400">{error}</span>}
          extra={[
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              key="retry"
              onClick={() => {
                setError(null);
                fetchQuizzes();
              }}
            >
              Retry
            </Button>,
            <Button
              key="back"
              icon={<ArrowLeftOutlined />}
              className="dark-button-secondary"
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          ]}
        />
      </div>
    );
  }

  return (
    <div className="test-panel-container">
      {/* Header */}
      <div className="test-panel-header">
        <div className="flex items-center gap-4">
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white"
          />
          <div>
            <h1 className="test-panel-title">Quizzes</h1>
            <p style={{ color: '#888', margin: 0 }}>Manage quizzes in this folder</p>
          </div>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalVisible(true);
            setEditingQuiz(null);
            quizForm.resetFields();
          }}
          size="large"
        >
          Create New Quiz
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-[#171717] p-4 rounded-xl border border-[#262626] mb-6">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined className="text-gray-500" />}
              placeholder="Search quizzes..."
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              className="dark-input"
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              placeholder="Filter Category"
              onChange={(value) => setSelectedCategory(value)}
              allowClear
              className="w-full dark-select"
              popupClassName="dark-select-dropdown"
              suffixIcon={<FilterOutlined className="text-gray-500" />}
            >
              {[...new Set(quizzes.map((quiz) => quiz.category))].map((category) => (
                <Option key={category} value={category}>{category}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex items-center gap-3 bg-[#1f1f1f] px-4 py-2 rounded-lg border border-[#262626] w-fit">
              <span className="text-gray-400 text-sm">Active Only</span>
              <Switch
                checked={showOnlyActive}
                onChange={(checked) => setShowOnlyActive(checked)}
                size="small"
              />
            </div>
          </Col>
        </Row>
      </div>

      {/* Table */}
      <Table
        dataSource={filteredQuizzes}
        columns={columns}
        rowKey="_id"
        pagination={{
          pageSize: 8,
          className: "dark-pagination",
          itemRender: (_, type, originalElement) => {
            if (type === 'prev') return <a className="text-gray-400">Prev</a>;
            if (type === 'next') return <a className="text-gray-400">Next</a>;
            return originalElement;
          }
        }}
        scroll={{ x: 800 }}
        className="dark-table"
      />

      {/* Create/Edit Modal */}
      <Modal
        title={editingQuiz ? "Edit Quiz" : "Create Quiz"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        wrapClassName="dark-modal"
      >
        <Form
          form={quizForm}
          layout="vertical"
          onFinish={(values) => {
            const durationInMinutes = (values.durationHours || 0) * 60 + (values.durationMinutes || 0);
            handleQuizSubmit({
              ...values,
              duration: durationInMinutes,
              isFreeTest: values.isFreeTest || false
            });
          }}
          initialValues={{
            durationHours: editingQuiz ? Math.floor((editingQuiz.duration?.hours || 0) * 60 + (editingQuiz.duration?.minutes || 0)) / 60 : 0,
            durationMinutes: editingQuiz ? ((editingQuiz.duration?.hours || 0) * 60 + (editingQuiz.duration?.minutes || 0)) % 60 : 0,
            isFreeTest: editingQuiz ? editingQuiz.isFreeTest || false : false,
          }}
          className="py-2"
        >
          <Form.Item
            name="quizName"
            label={<span className="text-gray-400">Quiz Name</span>}
            rules={[{ required: true, message: "Please input quiz name" }]}
          >
            <Input className="dark-input" />
          </Form.Item>
          <Form.Item
            name="category"
            label={<span className="text-gray-400">Category</span>}
            rules={[{ required: true, message: "Please input category" }]}
          >
            <Input className="dark-input" />
          </Form.Item>
          <Form.Item label={<span className="text-gray-400">Duration</span>}>
            <Space>
              <Form.Item
                name="durationHours"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <Input type="number" placeholder="Hrs" min={0} className="dark-input w-20" />
              </Form.Item>
              <span className="text-gray-500">:</span>
              <Form.Item
                name="durationMinutes"
                noStyle
                rules={[{ required: true, message: "Required" }]}
              >
                <Input type="number" placeholder="Min" min={0} max={59} className="dark-input w-20" />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item
            name="isFreeTest"
            valuePropName="checked"
            label={<span className="text-gray-400">Free Test</span>}
          >
            <Switch />
          </Form.Item>
          <Form.Item className="mb-0 pt-4 text-right">
            <Button onClick={() => setIsModalVisible(false)} className="mr-2 dark-button-secondary">Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingQuiz ? "Update Quiz" : "Create Quiz"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Attempts Modal */}
      <Modal
        open={attemptModalVisible}
        onCancel={() => setAttemptModalVisible(false)}
        footer={null}
        title="Set Quiz Attempts"
        wrapClassName="dark-modal"
      >
        <Form onFinish={handleSetQuizAttempts} layout="vertical" className="py-4">
          <Form.Item
            name="maxAttempts"
            label={<span className="text-gray-400">Maximum Attempts</span>}
            rules={[{ required: true, message: "Please input max attempts" }]}
          >
            <Input type="number" min={1} className="dark-input" />
          </Form.Item>
          <div className="text-right">
            <Button type="primary" htmlType="submit">Save Settings</Button>
          </div>
        </Form>
      </Modal>

      {/* Availability Modal */}
      <Modal
        open={availabilityModalVisible}
        onCancel={() => {
          setAvailabilityModalVisible(false);
          setSelectedQuiz(null);
        }}
        footer={null}
        title="Update Quiz Availability"
        wrapClassName="dark-modal"
      >
        {selectedQuiz && quizAvailability[selectedQuiz] ? (
          <Form
            layout="vertical"
            initialValues={{
              availabilityType: quizAvailability[selectedQuiz]?.availabilityType || "always",
              isActive: quizAvailability[selectedQuiz]?.isActive || false,
              scheduledStartDate: quizAvailability[selectedQuiz]?.scheduledStartDate || "",
              scheduledStartTime: quizAvailability[selectedQuiz]?.scheduledStartTime || "",
              scheduledEndDate: quizAvailability[selectedQuiz]?.scheduledEndDate || "",
              scheduledEndTime: quizAvailability[selectedQuiz]?.scheduledEndTime || "",
            }}
            onFinish={(values) => {
              const payload = {
                availabilityType: values.availabilityType,
                isActive: values.availabilityType === "always" ? values.isActive : true,
              };
              if (values.availabilityType === "scheduled") {
                payload.scheduledStartDate = values.scheduledStartDate;
                payload.scheduledStartTime = values.scheduledStartTime;
                payload.scheduledEndDate = values.scheduledEndDate;
                payload.scheduledEndTime = values.scheduledEndTime;
              }
              updateQuizAvailability(selectedQuiz, payload);
            }}
            className="py-2"
          >
            <Form.Item
              name="availabilityType"
              label={<span className="text-gray-400">Availability Type</span>}
            >
              <Select className="dark-select" popupClassName="dark-select-dropdown">
                <Option value="always">Always Available</Option>
                <Option value="scheduled">Scheduled Window</Option>
              </Select>
            </Form.Item>

            <Form.Item noStyle shouldUpdate>
              {({ getFieldValue }) =>
                getFieldValue("availabilityType") === "scheduled" && (
                  <div className="bg-[#1f1f1f] p-4 rounded-lg mb-4 border border-[#333]">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item name="scheduledStartDate" label={<span className="text-gray-400">Start Date</span>}><Input type="date" className="dark-input" /></Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="scheduledStartTime" label={<span className="text-gray-400">Start Time</span>}><Input type="time" className="dark-input" /></Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="scheduledEndDate" label={<span className="text-gray-400">End Date</span>}><Input type="date" className="dark-input" /></Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item name="scheduledEndTime" label={<span className="text-gray-400">End Time</span>}><Input type="time" className="dark-input" /></Form.Item>
                      </Col>
                    </Row>
                  </div>
                )
              }
            </Form.Item>

            <div className="text-right mt-4">
              <Button type="primary" htmlType="submit">Update Availability</Button>
            </div>
          </Form>
        ) : (
          <div className="flex justify-center py-8"><Spin /></div>
        )}
      </Modal>
    </div>
  );
};

export default HOC(TestCreationPage);
