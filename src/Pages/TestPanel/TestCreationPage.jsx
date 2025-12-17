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
  const [availabilityModalVisible, setAvailabilityModalVisible] =
    useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [attemptModalVisible, setAttemptModalVisible] = useState(false);
  const navigate = useNavigate();

  // Fetch all quizzes
  const fetchQuizzes = async () => {
    try {
      setLoading(true);
      console.log("Fetching quizzes for folder:", id);
      
      const response = await api.get(`/admin/folder/${id}`);
      console.log("Quiz fetch response:", response.data);
      
      if (response.data.success === false) {
        throw new Error(response.data.message || "Failed to fetch quizzes");
      }
      
      const quizzesData = response.data.quizzes || [];
      console.log("Quizzes data:", quizzesData);
      
      setQuizzes(quizzesData);
      setFilteredQuizzes(quizzesData);
      
      if (quizzesData.length === 0) {
        console.log("No quizzes found in this folder");
      }
      
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
    // Only fetch if we have a valid folder ID
    if (id && id !== 'undefined' && id !== 'null') {
      console.log("Component mounted, fetching quizzes for folder:", id);
      fetchQuizzes();
    } else {
      console.error("Invalid folder ID:", id);
      message.error("Invalid folder ID. Please navigate from the test panel.");
      navigate(-1);
    }
  }, [id, navigate]);

  // Fetch quiz availability for a specific quiz
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

  // Update quiz availability for a specific quiz
  const updateQuizAvailability = async (quizId, payload) => {
    try {
      setLoading(true);
      const response = await api.patch(
        `/admin/quizzes/${quizId}/availability`,
        payload
      );

      // Update local availability state
      const updatedAvailability = response.data.updatedAvailability || {};
      setQuizAvailability((prev) => ({
        ...prev,
        [quizId]: updatedAvailability,
      }));

      // Update quizzes state to reflect changes in the table
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
      console.log("Submitting quiz form:", values);

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

      console.log("Request body:", requestBody);

      let response;
      if (editingQuiz) {
        console.log("Updating existing quiz:", editingQuiz._id);
        response = await api.put(`/admin/quizzes/${editingQuiz._id}`, requestBody);
        
        if (response.data.success === false) {
          throw new Error(response.data.message || "Failed to update quiz");
        }
        
        message.success("Quiz updated successfully.");
      } else {
        console.log("Creating new quiz in folder:", id);
        response = await api.post(`/admin/quizzes/${id}`, requestBody);
        
        console.log("Quiz creation response:", response.data);
        
        if (response.data.success === false) {
          throw new Error(response.data.message || "Failed to create quiz");
        }
        
        message.success("Quiz created successfully.");
      }

      // Close modal and reset form immediately
      setIsModalVisible(false);
      quizForm.resetFields();
      setEditingQuiz(null);
      
      // Refresh quiz list with a small delay to ensure backend has processed
      console.log("Refreshing quiz list...");
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
      
      // Don't close modal on error, let user retry
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
      await api.patch(`/admin/quizzes/${selectedQuiz}/attempts`, {
        maxAttempts,
      });
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

      // Update local state
      setQuizzes((prev) =>
        prev.map((quiz) => (quiz._id === quizId ? { ...quiz, isActive } : quiz))
      );

      setFilteredQuizzes((prev) =>
        prev.map((quiz) => (quiz._id === quizId ? { ...quiz, isActive } : quiz))
      );

      message.success(
        `Quiz ${isActive ? "activated" : "deactivated"} successfully.`
      );
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
      width: "20%", // Assign a width
      align: "center", // Center title and content
      render: (text, record) => (
        <Space>
          <BookOutlined />
          <a onClick={() => navigate(`/test-details/${record._id}`)}>{text}</a>
        </Space>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: "15%", // Assign a width
      align: "center", // Center title and content
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
      width: "15%", // Assign a width
      align: "center", // Center title and content
      render: (duration) => {
        const { hours = 0, minutes = 0 } = duration || {};
        return `${hours}h ${minutes}m`;
      },
    },
    {
      title: "Status",
      dataIndex: "isActive",
      key: "isActive",
      width: "15%", // Assign a width
      align: "center", // Center title and content
      render: (isActive, record) => (
        <Switch
          checked={isActive}
          onChange={(checked) => toggleQuizActive(record._id, checked)}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "30%", // Wider width for buttons and actions
      align: "center", // Center title
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingQuiz(record);
              quizForm.setFieldsValue(record);
              setIsModalVisible(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this quiz?"
            onConfirm={() => handleDeleteQuiz(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
          <Button
            icon={<ClockCircleOutlined />}
            onClick={() => fetchQuizAvailability(record._id)}
          >
            Availability
          </Button>
          <Button
            icon={<SettingOutlined />}
            onClick={() => {
              setSelectedQuiz(record._id);
              setAttemptModalVisible(true);
            }}
          >
            Attempts
          </Button>
        </Space>
      ),
    },
  ];

  if (loading && quizzes.length === 0) {
    return (
      <LoadingSpinner 
        size="large" 
        tip="Loading quizzes..." 
        style={{ minHeight: '400px' }}
      />
    );
  }

  if (error && quizzes.length === 0) {
    return (
      <Result
        icon={<ExclamationCircleOutlined />}
        title="Failed to Load Quizzes"
        subTitle={error}
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
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        ]}
      />
    );
  }

  return (
    <div className="mt-10">
      {/* Header, Filters, and Table */}
      <Row
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button
          type="default"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Back
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setIsModalVisible(true);
            setEditingQuiz(null);
            quizForm.resetFields();
          }}
        >
          New Quiz
        </Button>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Input
            placeholder="Search by Quiz Name"
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Select
            placeholder="Filter by Category"
            onChange={(value) => setSelectedCategory(value)}
            allowClear
            style={{ width: "100%" }}
          >
            {[...new Set(quizzes.map((quiz) => quiz.category))].map(
              (category) => (
                <Option key={category} value={category}>
                  {category}
                </Option>
              )
            )}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <div className="flex items-center">
            <Switch
              checked={showOnlyActive}
              onChange={(checked) => setShowOnlyActive(checked)}
              checkedChildren="Active Only"
              unCheckedChildren="All"
            />
          </div>
        </Col>
      </Row>

      <Spin spinning={loading}>
        <Table
          dataSource={filteredQuizzes}
          columns={columns}
          rowKey="_id"
          pagination={{ pageSize: 7 }}
          scroll={{ x: 800 }}
          responsive={true}
        />
      </Spin>

      {/* Modal for Adding/Editing Quiz */}
      <Modal
        title={editingQuiz ? "Edit Quiz" : "Create Quiz"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form
          form={quizForm}
          layout="vertical"
          onFinish={(values) => {
            const durationInMinutes =
              (values.durationHours || 0) * 60 + (values.durationMinutes || 0);
            handleQuizSubmit({ 
              ...values, 
              duration: durationInMinutes,
              isFreeTest: values.isFreeTest || false
            });
          }}
          initialValues={{
            durationHours: editingQuiz
              ? Math.floor((editingQuiz.duration?.hours || 0) * 60 + (editingQuiz.duration?.minutes || 0)) / 60
              : 0,
            durationMinutes: editingQuiz 
              ? ((editingQuiz.duration?.hours || 0) * 60 + (editingQuiz.duration?.minutes || 0)) % 60
              : 0,
            isFreeTest: editingQuiz ? editingQuiz.isFreeTest || false : false,
          }}
        >
          <Form.Item
            name="quizName"
            label="Quiz Name"
            rules={[{ required: true, message: "Please input quiz name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please input category" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Duration">
            <Space>
              <Form.Item
                name="durationHours"
                noStyle
                rules={[{ required: true, message: "Please input hours" }]}
              >
                <Input
                  type="number"
                  placeholder="Hours"
                  min={0}
                  style={{ width: "70px" }}
                />
              </Form.Item>
              <span>:</span>
              <Form.Item
                name="durationMinutes"
                noStyle
                rules={[{ required: true, message: "Please input minutes" }]}
              >
                <Input
                  type="number"
                  placeholder="Minutes"
                  min={0}
                  max={59}
                  style={{ width: "70px" }}
                />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item
            name="isFreeTest"
            valuePropName="checked"
            label="Free Test"
            tooltip="Mark this quiz as a free test that will be visible to all users"
          >
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingQuiz ? "Update" : "Create"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Setting Attempts */}
      <Modal
        open={attemptModalVisible}
        onCancel={() => setAttemptModalVisible(false)}
        footer={null}
        title="Set Quiz Attempts"
      >
        <Form onFinish={handleSetQuizAttempts}>
          <Form.Item
            name="maxAttempts"
            label="Maximum Attempts"
            rules={[{ required: true, message: "Please input max attempts" }]}
          >
            <Input type="number" min={1} />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form>
      </Modal>

      {/* Modal for Quiz Availability */}
      <Modal
        open={availabilityModalVisible}
        onCancel={() => {
          setAvailabilityModalVisible(false);
          setSelectedQuiz(null);
        }}
        footer={null}
        title="Update Quiz Availability"
      >
        {selectedQuiz && quizAvailability[selectedQuiz] ? (
          <>
            {/* Display Current Availability Details */}
            {quizAvailability[selectedQuiz]?.availabilityType ===
              "scheduled" && (
              <div
                style={{
                  marginBottom: 16,
                  padding: 12,
                  border: "1px solid #f0f0f0",
                  borderRadius: 8,
                  background: "#fafafa",
                }}
              >
                <h6>Current Availability Details</h6>
                <p>
                  <strong>Start Date:</strong>{" "}
                  {quizAvailability[selectedQuiz]?.scheduledStartDate ||
                    "Not Set"}
                </p>
                <p>
                  <strong>Start Time:</strong>{" "}
                  {quizAvailability[selectedQuiz]?.scheduledStartTime ||
                    "Not Set"}
                </p>
                <p>
                  <strong>End Date:</strong>{" "}
                  {quizAvailability[selectedQuiz]?.scheduledEndDate ||
                    "Not Set"}
                </p>
                <p>
                  <strong>End Time:</strong>{" "}
                  {quizAvailability[selectedQuiz]?.scheduledEndTime ||
                    "Not Set"}
                </p>
              </div>
            )}

            {/* Update Form */}
            <Form
              layout="vertical"
              initialValues={{
                availabilityType:
                  quizAvailability[selectedQuiz]?.availabilityType || "always",
                isActive: quizAvailability[selectedQuiz]?.isActive || false,
                scheduledStartDate:
                  quizAvailability[selectedQuiz]?.scheduledStartDate || "",
                scheduledStartTime:
                  quizAvailability[selectedQuiz]?.scheduledStartTime || "",
                scheduledEndDate:
                  quizAvailability[selectedQuiz]?.scheduledEndDate || "",
                scheduledEndTime:
                  quizAvailability[selectedQuiz]?.scheduledEndTime || "",
              }}
              onFinish={(values) => {
                const payload = {
                  availabilityType: values.availabilityType,
                  isActive:
                    values.availabilityType === "always"
                      ? values.isActive
                      : true, // Scheduled quizzes are always active during their scheduled range.
                };
                if (values.availabilityType === "scheduled") {
                  if (values.scheduledStartDate && values.scheduledStartTime) {
                    payload.scheduledStartDate = values.scheduledStartDate;
                    payload.scheduledStartTime = values.scheduledStartTime;
                  }
                  if (values.scheduledEndDate && values.scheduledEndTime) {
                    payload.scheduledEndDate = values.scheduledEndDate;
                    payload.scheduledEndTime = values.scheduledEndTime;
                  }
                }
                updateQuizAvailability(selectedQuiz, payload);
              }}
            >
              {/* Availability Type Selector */}
              <Form.Item
                name="availabilityType"
                label="Availability Type"
                rules={[
                  {
                    required: true,
                    message: "Please select an availability type",
                  },
                ]}
              >
                <Select>
                  <Option value="always">Always</Option>
                  <Option value="scheduled">Scheduled</Option>
                </Select>
              </Form.Item>

              {/* Scheduled Fields (Start/End Dates and Times) */}
              <Form.Item
                noStyle
                shouldUpdate={(prev, curr) =>
                  prev.availabilityType !== curr.availabilityType
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("availabilityType") === "scheduled" && (
                    <>
                      <Form.Item
                        name="scheduledStartDate"
                        label="Start Date"
                        rules={[
                          {
                            required: true,
                            message:
                              "Start date is required for scheduled availability",
                          },
                        ]}
                      >
                        <Input type="date" />
                      </Form.Item>
                      <Form.Item
                        name="scheduledStartTime"
                        label="Start Time"
                        rules={[
                          {
                            required: true,
                            message:
                              "Start time is required for scheduled availability",
                          },
                        ]}
                      >
                        <Input type="time" />
                      </Form.Item>
                      <Form.Item name="scheduledEndDate" label="End Date">
                        <Input type="date" />
                      </Form.Item>
                      <Form.Item name="scheduledEndTime" label="End Time">
                        <Input type="time" />
                      </Form.Item>
                    </>
                  )
                }
              </Form.Item>

              {/* Submit Button */}
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Update Availability
                </Button>
              </Form.Item>
            </Form>
          </>
        ) : (
          <Spin />
        )}
      </Modal>
    </div>
  );
};

export default HOC(TestCreationPage);
