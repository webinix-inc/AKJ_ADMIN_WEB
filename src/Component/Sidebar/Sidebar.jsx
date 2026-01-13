import React, { useRef, useState, memo, useEffect } from "react";
import { useSelector } from "react-redux";
import { NavLink, useLocation } from "react-router-dom";
import "./Sidebar.css";
import api from "../../api/axios";
import { io } from "socket.io-client";

import { FaChalkboardTeacher, FaUser, FaUserGraduate, FaBars, FaTimes } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import {
  IoAnalyticsOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { LuBookmarkMinus } from "react-icons/lu";
import { MdOutlineContentCopy, MdStore } from "react-icons/md";
import { TiDocumentText } from "react-icons/ti";
import { VscTools } from "react-icons/vsc";

// Socket connection for real-time updates
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://lms-backend-724799456037.europe-west1.run.app";
const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
});

const Sidebar = () => {
  const adminData = useSelector((state) => state.admin.adminData);
  const { permissions, userType } = adminData?.data || {};
  const currentUserId = adminData?.data?.userId;

  const [isUserManagementHovered, setUserManagementHovered] = useState(false);
  const [isReportHovered, setReportHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const [totalUnreadMessages, setTotalUnreadMessages] = useState(0);

  const userDropdownRef = useRef(null);
  const reportDropdownRef = useRef(null);

  const location = useLocation();

  // Fetch total unread messages on mount
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get("/chat/users/withMessages", {
          params: { page: 1, limit: 100 },
        });
        setTotalUnreadMessages(response.data.totalUnreadMessages || 0);
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };

    fetchUnreadCount();

    // Join socket room for real-time updates
    if (currentUserId) {
      socket.emit("join", currentUserId);
    }

    // Listen for new messages to update count
    const handleNewMessage = (messageData) => {
      // If it's an incoming message (not from us), increment count
      if (messageData.sender !== currentUserId) {
        setTotalUnreadMessages(prev => prev + 1);
      }
    };

    socket.on("message", handleNewMessage);

    return () => {
      socket.off("message", handleNewMessage);
    };
  }, [currentUserId]);

  const isParentActive = (subItems) => {
    return subItems.some((item) => location.pathname === item.link);
  };

  const sidebarItems = [
    {
      text: "Home",
      link: "/home",
      icon: <GoHomeFill size={20} />,
      permission: true,
    },
    {
      text: "Courses & Tests",
      link: "/courses_tests/courses",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.coursesPermission,
    },
    {
      text: "Content",
      link: "/folder",
      icon: <MdOutlineContentCopy size={20} />,
      permission: permissions?.coursesPermission,
    },
    {
      text: "Test Panel",
      link: "/content/testpanel",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.testPortalPermission,
    },
    {
      text: "Book Store",
      link: "/bookStore",
      icon: <MdStore size={20} />,
      permission: permissions?.bookStorePermission,
    },
    {
      text: "Plans",
      link: "/plans",
      icon: <LuBookmarkMinus size={20} />,
      permission: permissions?.planPermission,
    },
    {
      text: "Messages",
      link: "/messages",
      icon: <IoChatbubbleEllipsesOutline size={20} />,
      permission: permissions?.chatPermission,
      messagecount: totalUnreadMessages > 0 ? totalUnreadMessages.toString() : null,
    },
    {
      text: "Marketing Services",
      link: "/selfservice",
      icon: <VscTools size={20} />,
      permission: permissions?.marketingServicesPermission,
    },
  ];

  const userManagementItem = {
    text: "User Management",
    icon: <FaUser size={20} />,
    permission: permissions?.peoplePermission,
  };

  const userSubItems = [
    {
      text: "Students",
      link: "/students",
      icon: <FaUserGraduate size={20} />,
      permission: permissions?.peoplePermission,
    },
    {
      text: "Teachers",
      link: "/teachers",
      icon: <FaChalkboardTeacher size={20} />,
      permission: permissions?.peoplePermission,
    },
  ];

  const reportAnalyticsItem = {
    text: "Report and Analytic",
    icon: <IoAnalyticsOutline size={20} />,
    permission: permissions?.reportAndAnalyticPermission,
  };

  const reportSubItems = [
    {
      text: "Course Orders",
      link: "/orders",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.reportAndAnalyticPermission,
    },
    {
      text: "Book Orders",
      link: "/books/orders",
      icon: <MdStore size={20} />,
      permission: permissions?.reportAndAnalyticPermission,
    },
  ];

  const handleMouseEnter = (setHover) => {
    clearTimeout(dropdownTimeout);
    setHover(true);
  };

  const handleMouseLeave = (setHover, ref) => {
    const timeout = setTimeout(() => {
      if (!ref.current?.matches(":hover")) {
        setHover(false);
      }
    }, 200);
    setDropdownTimeout(timeout);
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  return (
    <>
      <button className="mobile-toggle" onClick={toggleMobileSidebar}>
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay ${isMobileOpen ? 'visible' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      <div className={`sidebar-container ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-content">
          <div className="sidebar-header">
            <h6>AKJ Classes</h6>
          </div>
          <div className="sidebar-nav">
            {sidebarItems
              .filter((item) => userType === "ADMIN" || item.permission)
              .map((item, index) => (
                <NavLink
                  key={index}
                  to={item.link}
                  className="nav-item"
                  activeClassName="active"
                  onClick={() => setIsMobileOpen(false)}
                >
                  <div className="nav-content">
                    <span className="nav-icon">{item.icon}</span>
                    <p className="nav-text">{item.text}</p>
                    {item.messagecount && (
                      <div className="nav-badge">
                        <span>{item.messagecount}</span>
                      </div>
                    )}
                  </div>
                </NavLink>
              ))}

            {/* Report and Analytic Dropdown */}
            {(userType === "ADMIN" || reportAnalyticsItem.permission) && (
              <div className="dropdown-wrapper">
                <div
                  className={`nav-item dropdown-trigger ${isParentActive(reportSubItems) ? "active" : ""
                    }`}
                  onMouseEnter={() => handleMouseEnter(setReportHovered)}
                  onMouseLeave={() =>
                    handleMouseLeave(setReportHovered, reportDropdownRef)
                  }
                >
                  <div className="nav-content">
                    <span className="nav-icon">{reportAnalyticsItem.icon}</span>
                    <p className="nav-text">{reportAnalyticsItem.text}</p>
                  </div>
                </div>
                <div
                  ref={reportDropdownRef}
                  className={`sidebar-submenu ${isReportHovered ? "show" : ""}`}
                  onMouseEnter={() => handleMouseEnter(setReportHovered)}
                  onMouseLeave={() =>
                    handleMouseLeave(setReportHovered, reportDropdownRef)
                  }
                >
                  {reportSubItems
                    .filter((item) => userType === "ADMIN" || item.permission)
                    .map((subItem, index) => (
                      <NavLink
                        key={index}
                        to={subItem.link}
                        className="nav-item sub-item"
                        activeClassName="active"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className="nav-content">
                          <span className="nav-icon">{subItem.icon}</span>
                          <p className="nav-text">{subItem.text}</p>
                        </div>
                      </NavLink>
                    ))}
                </div>
              </div>
            )}

            {/* User Management Dropdown */}
            {(userType === "ADMIN" || userManagementItem.permission) && (
              <div className="dropdown-wrapper">
                <div
                  className={`nav-item dropdown-trigger ${isParentActive(userSubItems) ? "active" : ""
                    }`}
                  onMouseEnter={() => handleMouseEnter(setUserManagementHovered)}
                  onMouseLeave={() =>
                    handleMouseLeave(setUserManagementHovered, userDropdownRef)
                  }
                >
                  <div className="nav-content">
                    <span className="nav-icon">{userManagementItem.icon}</span>
                    <p className="nav-text">{userManagementItem.text}</p>
                  </div>
                </div>
                <div
                  ref={userDropdownRef}
                  className={`sidebar-submenu ${isUserManagementHovered ? "show" : ""}`}
                  onMouseEnter={() => handleMouseEnter(setUserManagementHovered)}
                  onMouseLeave={() =>
                    handleMouseLeave(setUserManagementHovered, userDropdownRef)
                  }
                >
                  {userSubItems
                    .filter((item) => userType === "ADMIN" || item.permission)
                    .map((subItem, index) => (
                      <NavLink
                        key={index}
                        to={subItem.link}
                        className="nav-item sub-item"
                        activeClassName="active"
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className="nav-content">
                          <span className="nav-icon">{subItem.icon}</span>
                          <p className="nav-text">{subItem.text}</p>
                        </div>
                      </NavLink>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default memo(Sidebar);
