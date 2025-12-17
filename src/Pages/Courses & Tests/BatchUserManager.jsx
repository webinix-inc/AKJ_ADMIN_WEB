import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Table,
  Button,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Tag,
  Avatar,
  Row,
  Col,
  Card,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  DeleteOutlined,
  SearchOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { addUserToBatch, removeUserFromBatch } from "../../redux/slices/courseSlice";
import api from "../../api/axios";
import moment from "moment";

const { Option } = Select;
const { Search } = Input;

const BatchUserManager = ({ visible, onCancel, course, onRefresh }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.courses);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]); // For multiple user selection
  const [expiresIn, setExpiresIn] = useState(""); // Access duration in days
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [accessLoading, setAccessLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchUsers();
    }
  }, [visible]);

  useEffect(() => {
    // Filter users based on search text
    if (searchText) {
      const filtered = users.filter(user =>
        `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [users, searchText]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get("/chat/getUsersBasedOnRoles", {
        params: { page: 1, limitOnUser: 100 },
      });
      
      if (response.data && response.data.users) {
        // Filter out users who are already enrolled in this batch
        const enrolledUserIds = course.manualEnrollments?.map(enrollment => enrollment.user._id) || [];
        const availableUsers = response.data.users.filter(user => 
          !enrolledUserIds.includes(user._id)
        );
        setUsers(availableUsers);
        console.log("Fetched users:", availableUsers.length);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleAddUser = async () => {
    if (!selectedUserId) {
      message.warning("Please select a user to add");
      return;
    }

    try {
      const response = await dispatch(addUserToBatch({ 
        courseId: course._id, 
        userId: selectedUserId 
      }));
      
      if (response.type === 'batchCourses/addUserToBatch/fulfilled') {
        message.success("User added to batch course successfully!");
        setSelectedUserId(null);
        fetchUsers(); // Refresh available users
        onRefresh(); // Refresh parent component
      } else {
        message.error(response.payload || "Failed to add user to batch course");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      message.error("Failed to add user to batch course");
    }
  };

  // New function for advanced access management
  const handleBatchAccess = async (action) => {
    if (!selectedUserIds.length) {
      message.warning("Please select users to manage access");
      return;
    }

    try {
      setAccessLoading(true);
      const payload = {
        userIds: selectedUserIds,
        courseId: course._id,
        action
      };

      if (action === "ASSIGN" && expiresIn.trim() !== "") {
        const days = parseInt(expiresIn, 10);
        if (!isNaN(days) && days > 0) {
          payload.expiresIn = days;
        } else {
          message.warning("Please enter a valid number of days.");
          return;
        }
      }

      const response = await api.post("/admin/courses/access", payload);
      message.success(response.data.message || `Access ${action.toLowerCase()}ed successfully!`);
      
      // Reset form
      setSelectedUserIds([]);
      setExpiresIn("");
      fetchUsers(); // Refresh available users
      onRefresh(); // Refresh parent component
      
    } catch (error) {
      console.error("Error managing access:", error);
      message.error(error.response?.data?.message || `Failed to ${action.toLowerCase()} access`);
    } finally {
      setAccessLoading(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      const response = await dispatch(removeUserFromBatch({ 
        courseId: course._id, 
        userId 
      }));
      
      if (response.type === 'batchCourses/removeUserFromBatch/fulfilled') {
        message.success("User removed from batch course successfully!");
        fetchUsers(); // Refresh available users
        onRefresh(); // Refresh parent component
      } else {
        message.error(response.payload || "Failed to remove user from batch course");
      }
    } catch (error) {
      console.error("Error removing user:", error);
      message.error("Failed to remove user from batch course");
    }
  };

  const enrolledColumns = [
    {
      title: "User",
      key: "user",
      render: (_, record) => (
        <Space>
          <Avatar size="small">
            {record.user.firstName?.[0]}{record.user.lastName?.[0]}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.user.firstName} {record.user.lastName}
            </div>
            <div style={{ fontSize: "12px", color: "#666" }}>
              {record.user.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : status === "Inactive" ? "red" : "blue"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Enrolled Date",
      dataIndex: "enrolledDate",
      key: "enrolledDate",
      render: (date) => moment(date).format("MMM DD, YYYY"),
    },
    {
      title: "Enrolled By",
      key: "enrolledBy",
      render: (_, record) => (
        record.enrolledBy ? 
        `${record.enrolledBy.firstName} ${record.enrolledBy.lastName}` : 
        "System"
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Popconfirm
          title="Are you sure you want to remove this user from the batch?"
          onConfirm={() => handleRemoveUser(record.user._id)}
          okText="Yes"
          cancelText="No"
        >
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
          >
            Remove
          </Button>
        </Popconfirm>
      ),
    },
  ];

  const enrolledCount = course.manualEnrollments?.length || 0;
  const batchSize = course.batchSize || 50;

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <TeamOutlined />
          <span>Manage Batch Users - {course.batchName}</span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={1000}
      footer={null}
      destroyOnClose
    >
      <Row gutter={16}>
        {/* Advanced Access Management Section */}
        <Col span={24} style={{ marginBottom: 16 }}>
          <Card size="small" title="Advanced Access Management">
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Select Users:</label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select multiple users to manage access"
                value={selectedUserIds}
                onChange={setSelectedUserIds}
                loading={loadingUsers}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {filteredUsers.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                    {user.phone && ` - ${user.phone}`}
                  </Option>
                ))}
              </Select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                Access Duration (Days) <small style={{ color: '#666' }}>(Optional)</small>:
              </label>
              <Input
                type="number"
                min="1"
                placeholder="Enter number of days (leave empty for permanent access)"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                suffix={<ClockCircleOutlined />}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => handleBatchAccess("ASSIGN")}
                loading={accessLoading}
                disabled={!selectedUserIds.length}
              >
                Grant Access
              </Button>
              <Button
                danger
                onClick={() => handleBatchAccess("REVOKE")}
                loading={accessLoading}
                disabled={!selectedUserIds.length}
              >
                Revoke Access
              </Button>
            </div>

            <div style={{ marginTop: 12 }}>
              <Search
                placeholder="Search available users..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: "100%" }}
                allowClear
              />
            </div>
          </Card>
        </Col>

        {/* Simple Add User Section */}
        <Col span={24} style={{ marginBottom: 16 }}>
          <Card size="small" title="Quick Add Single User">
            <Space.Compact style={{ width: "100%" }}>
              <Select
                placeholder="Select a user to grant batch access"
                value={selectedUserId}
                onChange={setSelectedUserId}
                style={{ flex: 1 }}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
                loading={loadingUsers}
              >
                {filteredUsers.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<UserAddOutlined />}
                onClick={handleAddUser}
                loading={loading}
                disabled={!selectedUserId}
                                >
                    Grant Access
                  </Button>
            </Space.Compact>
          </Card>
        </Col>

        {/* Batch Statistics */}
        <Col span={24} style={{ marginBottom: 16 }}>
          <Card size="small">
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#1890ff" }}>
                    {enrolledCount}
                  </div>
                  <div style={{ color: "#666" }}>Users with Access</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
                    {batchSize}
                  </div>
                  <div style={{ color: "#666" }}>Batch Capacity</div>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fa8c16" }}>
                    {batchSize - enrolledCount}
                  </div>
                  <div style={{ color: "#666" }}>Available Spots</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Users with Batch Access Table */}
        <Col span={24}>
          <Card size="small" title={`Users with Batch Access (${enrolledCount})`}>
            <Table
              columns={enrolledColumns}
              dataSource={course.manualEnrollments || []}
              rowKey={(record) => record.user._id}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Total ${total} users`,
              }}
              size="small"
              loading={loading}
              locale={{
                emptyText: "No users have batch access yet"
              }}
            />
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

export default BatchUserManager;
