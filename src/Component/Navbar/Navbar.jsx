import React, { useEffect, useState, memo } from "react";
import "./Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { GiPlainCircle } from "react-icons/gi";

// import img from '../../Image/img.png'
import img from "../../Image/img3.png";
import Notifications from "../../Pages/Notifications/Notifications";
import api from "../../api/axios";

const Navbar = ({ toggleSidebar }) => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [profile, setProfile] = useState({
    firstName: "",
    profilePicture: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/getProfile");
        console.log("getProfile response is here :", res);
        const data = res.data?.data || {}; // adjust based on actual API structure
        setProfile({
          firstName: data.firstName || "",
          profilePicture: data.image || null,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Helper to get correct image URL
  const getProfileImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;

    // Get base URL from env and strip /api/v1 suffix to get server root
    const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8890/api/v1";
    const serverRoot = apiBaseUrl.replace("/api/v1", "");

    return `${serverRoot}/${imagePath}`;
  };

  return (
    <>
      <div className="navbar-container">
        <div className="navbar-content">
          <div className="navbar-left">
            {/* Placeholder for future left-side content or toggle button if needed */}
          </div>
          <div className="navbar-right">
            <div className="notification-wrapper" onClick={handleShow}>
              <div className="notification-icon">
                <FaRegBell size={24} />
              </div>
              <div className="notification-dot">
                <GiPlainCircle size={10} />
              </div>
            </div>

            {/* Profile dropdown (opens on click) */}
            <Dropdown
              className="profile-dropdown-container"
              align="end"
            >
              <Dropdown.Toggle
                className="profile-toggle"
                as="div"
                id="dropdown-custom-components"
              >
                {getProfileImageUrl(profile.profilePicture) ? (
                  <div className="profile-image-container">
                    <img
                      src={getProfileImageUrl(profile.profilePicture)}
                      className="profile-image"
                      alt="Profile"
                    />
                  </div>
                ) : (
                  <div className="profile-avatar-default">
                    <img src={img} alt="Profile" />
                  </div>
                )}

                <div className="profile-info">
                  <p className="profile-name">{profile.firstName || "User"}</p>
                  <IoIosArrowDown className="profile-arrow" />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="profile-menu">
                <Dropdown.Item href="/settings" className="profile-menu-item">Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/")} className="profile-menu-item">
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Notifications Offcanvas */}
      <Offcanvas show={show} onHide={handleClose} placement="end" className="notification-offcanvas">
        <Notifications handleClose={handleClose} />
      </Offcanvas>
    </>
  );
};

export default memo(Navbar);
