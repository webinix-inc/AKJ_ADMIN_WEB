import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { MdArrowDropDown } from "react-icons/md";
import img from "../../Image/img28.png"; // Placeholder image
import api from "../../api/axios";

const Notifications = ({ handleClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // 'all', 'broadcast', 'courseSpecific'
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="relative w-full bg-[#141414] text-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between bg-[#0d0d0d] px-4 py-3 border-b border-gray-600">
        <h6 className="text-lg font-bold">Notifications</h6>
        <button onClick={handleClose}>
          <IoMdClose size={24} className="text-gray-400 hover:text-gray-200" />
        </button>
      </div>

      {/* Filter Dropdown */}
      <div className="relative px-4 py-2">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center bg-gray-700 px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
          <MdArrowDropDown size={24} className="ml-2" />
        </button>
        {showDropdown && (
          <div className="absolute top-full mt-2 left-4 bg-[#0d0d0d] border border-gray-600 rounded-lg w-40 z-20">
            <ul>
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => handleFilterChange("all")}
              >
                All
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => handleFilterChange("broadcast")}
              >
                Broadcast
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-600 cursor-pointer"
                onClick={() => handleFilterChange("courseSpecific")}
              >
                Course Specific
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div
        className="p-4 space-y-4 max-h-[94vh] overflow-y-auto"
        onScroll={(e) => {
          const { scrollTop, scrollHeight, clientHeight } = e.target;
          if (scrollTop + clientHeight >= scrollHeight && !loading) {
            loadMoreNotifications();
          }
        }}
      >
        {loading && !notifications.length ? (
          <p className="text-center text-gray-400">Loading notifications...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : notifications.length > 0 ? (
          notifications.map((notif, index) => (
            <div
              key={notif._id || index}
              className="flex items-start space-x-4 bg-[#0d0d0d] border border-gray-600 rounded-lg p-4 hover:bg-gray-600 transition cursor-pointer"
              onClick={() => handleNotificationClick(notif)}
            >
              <img
                src={img}
                alt={`Notification from ${notif.title}`}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h4 className="text-sm font-semibold">{notif.title}</h4>
                <p className="text-sm text-gray-400 truncate">
                  {notif.message || notif.content}
                </p>
                <span className="text-xs text-gray-500">
                  {formatTime(notif.createdAt)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center text-center space-y-2">
            <img src={img} alt="No Notifications" className="w-16 h-16" />
            <h4 className="text-gray-400 font-medium">
              There are no new notifications in the admin panel
            </h4>
          </div>
        )}
      </div>

      {/* Notification Details Modal */}
      {selectedNotification && (
        <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
          <div className="bg-[#141414] w-4/5 max-w-2xl rounded-lg p-6 space-y-4">
            <h4 className="text-lg font-bold">{selectedNotification.title}</h4>
            <p className="text-gray-400">
              {selectedNotification.message || selectedNotification.content}
            </p>
            <span className="text-xs text-gray-500">
              {formatTime(selectedNotification.createdAt)}
            </span>
            <button
              onClick={() => setSelectedNotification(null)}
              className="bg-red-600 px-4 py-2 rounded-lg text-white hover:bg-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;