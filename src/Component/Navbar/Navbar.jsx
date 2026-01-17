import React, { useEffect, useState, memo, Suspense, lazy } from "react";
import "./Navbar.css";
import { Drawer, Dropdown, Menu } from "antd";
import { useNavigate }
  from "react-router-dom";
import { FaRegBell } from "react-icons/fa6";
import { IoIosArrowDown } from "react-icons/io";
import { GiPlainCircle } from "react-icons/gi";

// import img from '../../Image/img.png'
// import img from '../../Image/img.png'
import img from "../../Image/img3.png";
import api from "../../api/axios";

// Lazy load Notifications
const Notifications = lazy(() => import("../../Pages/Notifications/Notifications"));

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

  const menuItems = [
    {
      key: 'settings',
      label: <a href="/settings" className="profile-menu-item">Settings</a>,
    },
    {
      key: 'signout',
      label: <span className="profile-menu-item">Sign Out</span>,
      onClick: () => navigate("/"),
    },
  ];

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
              menu={{ items: menuItems }}
              trigger={['click']}
              placement="bottomRight"
              overlayClassName="custom-profile-dropdown"
            >
              <div
                className="profile-toggle"
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
              </div>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Notifications Drawer */}
      <Drawer
        title={null}
        closable={false}
        placement="right"
        onClose={handleClose}
        open={show}
        className="notification-offcanvas"
        width={400}
      >
        <Suspense fallback={<div className="p-4 text-white text-center">Loading Notifications...</div>}>
          <Notifications handleClose={handleClose} />
        </Suspense>
      </Drawer>
    </>
  );
};

export default memo(Navbar);
