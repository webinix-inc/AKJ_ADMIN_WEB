import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";

const NotificationPanel = () => {
  const [recipients, setRecipients] = useState([]);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Courses");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { courses } = useSelector((state) => state.courses);
  const dispatch = useDispatch();

  const [isBroadcast, setIsBroadcast] = useState(false);

  const toggleBroadcast = () => {
    setIsBroadcast((prev) => !prev);
  };

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
    }
  };

  const addRecipient = (recipient) => {
    setRecipients((prev) =>
      prev.includes(recipient)
        ? prev.filter((r) => r !== recipient)
        : [...prev, recipient]
    );
  };

  const removeRecipient = (index) => {
    setRecipients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim()) {
      alert("Title and Text are required");
      return;
    }

    const notificationData = {
      recipients: recipients.map((r) => r.id),
      title,
      message: text,
      image,
    };

    setLoading(true);
    setError(null);

    try {
      if (recipients.length > 0) {
        const courseIds = recipients.map((r) => r._id);
        const response = await api.post("/notification/course-specific", {
          title,
          courseIds,
          message: text,
          // sendVia: 'APP',
          metadata: {},
          // priority: 'normal',
        });

        if (response.data.success) {
          alert("Notification Created Successfully!");
          setTitle("");
          setText("");
          setImage(null);
          setRecipients([]);
        } else {
          alert("Failed to create notification: " + response.data.message);
        }
      } else {
        const response = await api.post("/admin/broadcast", notificationData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.data.success) {
          alert("Notification Created Successfully!");
          setTitle("");
          setText("");
          setImage(null);
          setRecipients([]);
        } else {
          alert("Failed to create notification: " + response.data.message);
        }
      }
    } catch (error) {
      console.error("Error creating notification:", error);
      setError("An error occurred while sending the notification.");
    } finally {
      setLoading(false);
    }
  };

  const menuItems = ["Courses"];

  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="notification-compose-page">
      <div className="compose-layout">
        {/* Compose Section */}
        <div className="compose-card">
          <h3 className="section-title">Compose Notification</h3>

          {/* Recipients Chips */}
          <div className="recipients-container">
            {recipients.map((recipient, index) => (
              <span key={index} className="recipient-chip">
                {recipient.title}
                <IoIosCloseCircle
                  className="chip-remove"
                  onClick={() => removeRecipient(index)}
                />
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons-row">
            <button onClick={toggleModal} className="action-btn secondary">
              <FaPlus />
              Add Recipients
            </button>
            <button
              onClick={toggleBroadcast}
              className={`action-btn ${isBroadcast ? "success" : "secondary"}`}
            >
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={toggleBroadcast}
                className="broadcast-checkbox"
              />
              Broadcast
            </button>
          </div>

          {/* Inputs */}
          <div className="form-group">
            <label className="form-label">Title*</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter notification title"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Text*</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter notification text"
              className="form-textarea"
              rows="4"
            />
          </div>

          {/* Image Upload */}
          <label className="image-upload-btn">
            <AiOutlinePicture size={20} />
            Add Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: "none" }}
            />
          </label>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notification"}
          </button>

          {error && <p className="error-text">{error}</p>}
        </div>

        {/* Device Preview Section */}
        <div className="preview-card-wrapper">
          <h3 className="section-title">Device Preview</h3>
          <div className="device-preview-box">
            <div className="preview-header-row">
              <span className="org-name">Organisation Name</span>
              <span className="preview-date">{new Date().toLocaleDateString()}</span>
            </div>

            <h4 className="preview-title">
              {title || "Notification Title"}
            </h4>
            <p className="preview-message">
              {text || "Notification text content will appear here..."}
            </p>

            {image && (
              <img
                src={image}
                alt="Preview"
                className="preview-image"
              />
            )}
          </div>
        </div>
      </div>

      {/* Add Recipients Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="recipient-modal">
            <button className="modal-close-icon" onClick={toggleModal}>
              &times;
            </button>

            <div className="modal-content-flex">
              {/* Sidebar Tabs */}
              <div className="modal-sidebar">
                {menuItems.map((item) => (
                  <div
                    key={item}
                    className={`modal-tab ${activeTab === item ? "active" : ""}`}
                    onClick={() => setActiveTab(item)}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Selection Area */}
              <div className="modal-main-area">
                <h3 className="modal-heading">Select Recipients</h3>

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search courses..."
                  className="modal-search-input"
                />

                <div className="modal-list-container">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="modal-list-item"
                      onClick={() => addRecipient(course)}
                    >
                      <span className="item-name">{course.title}</span>
                      <input
                        type="checkbox"
                        checked={recipients.includes(course)}
                        readOnly
                        className="item-checkbox"
                      />
                    </div>
                  ))}
                </div>

                <button onClick={toggleModal} className="modal-done-btn">
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HOC(NotificationPanel);
