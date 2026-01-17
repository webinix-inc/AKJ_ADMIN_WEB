import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdArrowDropDown } from "react-icons/md";
import { FaBell } from "react-icons/fa";
import img from "../../Image/img28.png"; // Placeholder image
import "./Notifications.css";
import api from "../../api/axios";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const Notifications = ({ handleClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'broadcast', 'courseSpecific'
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get User ID from Redux for Socket Room
  const adminData = useSelector((state) => state.admin.adminData);
  const userId = adminData?.data?._id;

  const fetchNotifications = async (page = 1, filterType = "all") => {
    setLoading(true);
    try {
      const response = await api.get("/admin/broadcast", {
        params: { page, filter: filterType },
      });
      const { notifications: newNotifications, totalPages: pages } = response.data;
      setNotifications((prev) =>
        page === 1 ? newNotifications : [...prev, ...newNotifications]
      );
      setTotalPages(pages || 1);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to fetch notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // 🔥 Real-time updates via Socket.IO
  useEffect(() => {
    if (!userId) return;

    // Initialize socket connection
    const socketUrl = process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace('/api/v1', '') : 'http://localhost:8890';

    const newSocket = io(socketUrl, {
      transports: ['websocket'],
      query: { userId }
    });

    console.log("🔌 Connecting to socket for Admin Notifications...", socketUrl);

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      newSocket.emit("joinNotificationRoom", userId);
    });

    newSocket.on("notification", (newNotification) => {
      console.log("🔔 New Admin Notification Received:", newNotification);

      // Update state immediately
      setNotifications(prev => [newNotification, ...prev]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId]);

  const loadMoreNotifications = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage + 1, filter);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    setNotifications([]);
    setCurrentPage(1);
    fetchNotifications(1, value);
  };

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 172800) return "Yesterday";
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="notifications-header">
        <h6 className="header-title">Notifications</h6>
        <button className="close-btn" onClick={handleClose}>
          <IoMdClose size={24} />
        </button>
      </div>

      {/* Filter Dropdown */}
      <div className="filter-section">
        <div className="filter-dropdown-wrapper">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="filter-toggle-btn"
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            <MdArrowDropDown size={24} className="dropdown-icon" />
          </button>
          {showDropdown && (
            <div className="filter-dropdown-menu">
              <ul>
                <li
                  className={`filter-option ${filter === "all" ? "active" : ""}`}
                  onClick={() => handleFilterChange("all")}
                >
                  All
                </li>
                <li
                  className={`filter-option ${filter === "broadcast" ? "active" : ""}`}
                  onClick={() => handleFilterChange("broadcast")}
                >
                  Broadcast
                </li>
                <li
                  className={`filter-option ${filter === "courseSpecific" ? "active" : ""}`}
                  onClick={() => handleFilterChange("courseSpecific")}
                >
                  Course Specific
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div
        className="notifications-list"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          if (scrollTop + clientHeight >= scrollHeight && !loading) {
            loadMoreNotifications();
          }
        }}
      >
        {loading && !notifications.length ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={notif._id || index}
              className="notification-card"
              onClick={() => handleNotificationClick(notif)}
            >
              <div className="notification-icon-wrapper">
                <div className="notification-icon-container">
                  <FaBell size={16} className="notification-icon-svg" />
                </div>
              </div>
              <div className="notification-content">
                <div className="notification-header-row">
                  <h4 className="notification-title">{notif.title}</h4>
                  <span className="notification-time">
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <p className="notification-message">
                  {notif.message || notif.content}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <img src={img} alt="No Notifications" className="empty-img" />
            <h4 className="empty-text">
              There are no new notifications
            </h4>
          </div>
        )}
        {loading && notifications.length > 0 && (
          <div className="loading-more">
            <div className="spinner-small"></div>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="notification-modal-overlay">
          <div className="notification-modal">
            <div className="modal-header">
              <h4 className="modal-title">{selectedNotification.title}</h4>
              <button
                onClick={() => setSelectedNotification(null)}
                className="modal-close-btn"
              >
                <IoMdClose size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-message">
                {selectedNotification.message || selectedNotification.content}
              </p>
              <span className="modal-time">
                {formatTime(selectedNotification.createdAt)}
              </span>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setSelectedNotification(null)}
                className="modal-action-btn"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Notifications;