import React, { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import img1 from "../../Image/img1.png";
import img2 from "../../Image/img2.png";
import { loginAdmin, resetLoginState } from "../../redux/slices/adminSlice"; // Import the loginAdmin action
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Access Redux state
  const { loading, error } = useSelector((state) => state.admin);

  // Reset loading state when component mounts to clear any persisted loading state
  useEffect(() => {
    dispatch(resetLoginState());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loginData = {
      email,
      password,
    };
    try {
      const res = await dispatch(loginAdmin(loginData)).unwrap();
      if (res && res.accessToken) {
        navigate("/home");
        localStorage.setItem("accessToken", res.accessToken);
      }
    } catch (error) {
      // Error is already handled by Redux and will be displayed
      console.error("Login error:", error);
    }
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
