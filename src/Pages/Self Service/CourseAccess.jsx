import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Select, Button, message, Card, Spin, Input } from "antd";
import { LockOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { fetchAllUserProfiles } from "../../redux/slices/userSlice"; // Fetch users from Redux
import { fetchCourses } from "../../redux/slices/courseSlice"; // Fetch courses from Redux
import api from "../../api/axios"; // Axios instance
import HOC from "../../Component/HOC/HOC";

const { Option } = Select;

const CourseAccess = () => {
  const dispatch = useDispatch();
  
  // Redux State
  const { allUsers, loading: usersLoading } = useSelector((state) => state.user);
  const { courses, loading: coursesLoading } = useSelector((state) => state.courses);

  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [expiresIn, setExpiresIn] = useState(""); // Expiration in days (optional)
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchAllUserProfiles()); // Fetch users from Redux
    dispatch(fetchCourses()); // Fetch courses from Redux
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
      setExpiresIn(""); // Reset input after submission
    } catch (error) {
      message.error(error.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Card title="Manage Course Access" bordered={false} style={{ maxWidth: 600, margin: "0 auto" }}>
        {loading || usersLoading || coursesLoading ? <Spin size="large" /> : (
          <>
            <div className="mb-4">
              <label>Select Users:</label>
              <Select
                mode="multiple"
                style={{ width: "100%" }}
                placeholder="Select users"
                onChange={(value) => setSelectedUsers(value)}
                loading={usersLoading}
              >
                {allUsers.map((user) => (
                  <Option key={user._id} value={user._id}>
                    {user.firstName} ({user.email})
                  </Option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label>Select Course:</label>
              <Select
                style={{ width: "100%" }}
                placeholder="Select course"
                onChange={(value) => setSelectedCourse(value)}
                loading={coursesLoading}
              >
                {courses.map((course) => (
                  <Option key={course._id} value={course._id}>
                    {course.title}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="mb-4">
              <label>Access Duration (Days) <small>(Optional)</small>:</label>
              <Input
                type="number"
                min="1"
                placeholder="Enter number of days (leave empty for permanent access)"
                value={expiresIn}
                onChange={(e) => setExpiresIn(e.target.value)}
                suffix={<ClockCircleOutlined />}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="primary"
                icon={<LockOutlined />}
                onClick={() => handleAccess("ASSIGN")}
                loading={loading}
              >
                Grant Access
              </Button>

              <Button
                type="danger"
                onClick={() => handleAccess("REVOKE")}
                loading={loading}
              >
                Revoke Access
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default HOC(CourseAccess);
