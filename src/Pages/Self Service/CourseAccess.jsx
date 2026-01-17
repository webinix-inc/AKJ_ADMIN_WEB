import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Button, message, Spin, Input, Form } from "antd";
import { LockOutlined, ClockCircleOutlined, UserOutlined, BookOutlined } from "@ant-design/icons";
import { fetchAllUserProfiles } from "../../redux/slices/userSlice";
import { fetchCourses } from "../../redux/slices/courseSlice";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import './SelfService.css';

const { Option } = Select;

const CourseAccess = () => {
  const dispatch = useDispatch();

  // Redux State
  const { allUsers, loading: usersLoading } = useSelector((state) => state.user);
  const { courses, loading: coursesLoading } = useSelector((state) => state.courses);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expiresIn, setExpiresIn] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUserProfiles());
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleAccess = async (action) => {
    if (!selectedUsers.length || !selectedCourse) {
      return message.warning("Please select users and a course.");
    }

    try {
      setLoading(true);
      const payload = {
        userIds: selectedUsers,
        courseId: selectedCourse,
        action
      };

      if (action === "ASSIGN" && expiresIn.trim() !== "") {
        const days = parseInt(expiresIn, 10);
        if (!isNaN(days) && days > 0) {
          payload.expiresIn = days;
        } else {
          return message.warning("Please enter a valid number of days.");
        }
      }

      const response = await api.post("/admin/courses/access", payload);
      message.success(response.data.message);
      if (action === "ASSIGN") setExpiresIn("");
      setSelectedUsers([]);
      setSelectedCourse(null);
    } catch (error) {
      message.error(error.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="self-service-container">
      <div className="page-header justify-center text-center">
        <div>
          <h1 className="page-title">🔐 Manage Course Access</h1>
          <p className="page-subtitle">Grant or revoke course access for students manually.</p>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="glass-card p-8 w-full max-w-2xl">
          {(loading || usersLoading || coursesLoading) && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 rounded-xl">
              <Spin size="large" />
            </div>
          )}

          <Form layout="vertical">
            <Form.Item label={<span className="dark-label"><UserOutlined /> Select Students</span>}>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Search and select students..."
                onChange={(value) => setSelectedUsers(value)}
                value={selectedUsers}
                loading={usersLoading}
                className="dark-select"
                dropdownClassName="dark-dropdown"
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {allUsers.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={<span className="dark-label"><BookOutlined /> Select Course</span>}>
              <Select
                style={{ width: "100%" }}
                placeholder="Select a course..."
                onChange={(value) => setSelectedCourse(value)}
                value={selectedCourse}
                loading={coursesLoading}
                className="dark-select"
                dropdownClassName="dark-dropdown"
              >
                {courses.map((course) => (
                  <Option key={course._id} value={course._id}>
                    {course.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label={<span className="dark-label"><ClockCircleOutlined /> Access Duration (Days) <span className="text-gray-500 text-xs ml-1">(Optional: Leave empty for lifetime)</span></span>}>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                className="dark-input"
              />
            </Form.Item>

            <div className="flex gap-4 mt-8">
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => handleAccess("ASSIGN")}
                loading={loading}
                className="primary-btn flex-1 h-10 text-base"
              >
                Grant Access
              </Button>

              <Button
                type="primary"
                danger
                onClick={() => handleAccess("REVOKE")}
                loading={loading}
                className="flex-1 h-10 text-base rounded-md"
              >
                Revoke Access
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default HOC(CourseAccess);
