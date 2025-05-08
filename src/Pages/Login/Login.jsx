import React, { useState } from "react";
import "./Login.css";
import img1 from "../../Image/img1.png";
import img2 from "../../Image/img2.png";
import { FaEyeSlash, FaEye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "../../redux/slices/adminSlice"; // Import the loginAdmin action
import { setAuthToken } from "../../api/axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access Redux state
  const { loading, error, adminData } = useSelector((state) => state.admin);

  const handleSubmit = (e) => {
    e.preventDefault();
    const loginData = {
      email,
      password,
    };
    dispatch(loginAdmin(loginData)).then((res) => {
      if (res.type === "admin/loginAdmin/fulfilled") {
        navigate("/home");
        localStorage.setItem("accessToken", res?.payload.accessToken); // Redirect to home page on success
      }
    });
  };
  return (
    <>
      <div className="login">
        <div className="login1">
          <div className="login2">
            <h3>LOGO</h3>
          </div>
          <div className="login3">
            <div className="login4">
              <div className="login5">
                <h5>Welcome Back!</h5>
              </div>
              <div className="login6">
                <img src={img2} alt="" />
                <p>Sign in with Google</p>
              </div>
              <div className="login7">
                <p>or login with email</p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="login8">
                  <div className="login9">
                    <label>Email ID / username</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="login9">
                    <label>Password</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: "pointer",
                        }}
                      >
                        {showPassword ? (
                          <FaEye color="#818181" />
                        ) : (
                          <FaEyeSlash color="#818181" />
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="login10">
                  <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                  {error && <p className="error">{error.message}</p>}
                </div>
              </form>
            </div>
            <div className="login11">
              <img src={img1} alt="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
