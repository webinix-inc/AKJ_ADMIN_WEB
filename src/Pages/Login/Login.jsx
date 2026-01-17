import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import img1 from "../../Image/img1.png";
import { loginAdmin, resetLoginState } from "../../redux/slices/adminSlice";
import { Form, Input, Button, Row, Col, Typography, message } from "antd";
import { UserOutlined, LockOutlined, GoogleOutlined } from "@ant-design/icons";
import "./Login.css";

const { Title, Text } = Typography;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Note: showPassword state removed as Ant Design Input.Password handles it internally

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access Redux state
  const { loading, error } = useSelector((state) => state.admin);

  // Reset loading state when component mounts
  useEffect(() => {
    dispatch(resetLoginState());
  }, [dispatch]);

  const onFinish = async () => {
    const loginData = {
      email,
      password,
    };
    try {
      const res = await dispatch(loginAdmin(loginData)).unwrap();
      if (res && res.accessToken) {
        message.success("Login successful!");
        navigate("/home");
        localStorage.setItem("accessToken", res.accessToken);
      }
    } catch (error) {
      console.error("Login error:", error);
      // Redux handles error state, but we can also show a toast
      // message.error(error.message || "Login failed"); 
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <Row>
          {/* Left Side - Brand Image */}
          <Col xs={0} md={12} className="brand-section">
            <img src={img1} alt="Brand" className="brand-image" loading="lazy" />
            <div className="brand-overlay-text">
              <h1 className="brand-title">Welcome Admin</h1>
              <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px' }}>
                Manage your dashboard securely and efficiently.
              </Text>
            </div>
          </Col>

          {/* Right Side - Login Form */}
          <Col xs={24} md={12} className="form-section">
            <div className="form-header">
              <div style={{ marginBottom: '24px' }}>
                {/* Placeholder for Logo if needed, or just text */}
                <h3 style={{ color: '#0f65acff', fontSize: '24px', fontWeight: '900', margin: 0 }}>AKJ Classes</h3>
              </div>
              <h2 className="welcome-text">Welcome Back!</h2>
              <p className="subtitle-text">Please sign in to continue</p>
            </div>

            <Form
              layout="vertical"
              onFinish={onFinish}
              className="login-form"
              requiredMark={false}
              initialValues={{ email: "", password: "" }}
            >
              <Form.Item
                label="Email ID / Username"
                name="email"
                rules={[{ required: true, message: 'Please enter your email!' }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: '#666' }} />}
                  placeholder="Enter your email"
                  className="dark-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Form.Item>


              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please enter your password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#666' }} />}
                  placeholder="Enter your password"
                  className="dark-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="submit-btn"
                >
                  {loading ? "Logging in..." : "Login"}
                </Button>
              </Form.Item>

              {error && <p className="error-text">{error.message}</p>}
            </Form>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Login;
