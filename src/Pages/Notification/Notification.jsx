import React, { useEffect, useState } from "react";
import { IoIosCloseCircle } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import HOC from "../../Component/HOC/HOC";
import { fetchCourses } from "../../redux/slices/courseSlice";
import { useDispatch, useSelector } from "react-redux";
import api from "../../api/axios";
import { message } from "antd";

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
    <div className="bg-[#141414] text-white p-6 min-h-screen">
      <div className="flex gap-6">
        <div className="bg-[#0d0d0d] w-2/3 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Compose Notification</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {recipients.map((recipient, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full flex items-center gap-2">
                {recipient.title}
                <IoIosCloseCircle
                  className="cursor-pointer"
                  onClick={() => removeRecipient(index)}
                />
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={toggleModal}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2">
              <FaPlus />
              Add Recipients
            </button>
            <button
              onClick={toggleBroadcast}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                isBroadcast ? "bg-green-500" : "bg-blue-500"
              } text-white`}>
              <input
                type="checkbox"
                checked={isBroadcast}
                onChange={toggleBroadcast}
                className="form-checkbox text-blue-500 border-white focus:ring-white"
              />
              Broadcast
            </button>
          </div>

          <label className="block text-sm font-medium mb-2">Title*</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter notification title here"
            className="w-full border border-gray-700 bg-gray-700 text-white rounded-lg px-3 py-2 mb-4"
          />

          <label className="block text-sm font-medium mb-2">Text*</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter notification text here"
            className="w-full border border-gray-700 bg-gray-700 text-white rounded-lg px-3 py-2 mb-4"
            rows="4"
          />

          <label className="cursor-pointer px-4 py-2 rounded-lg bg-blue-500 text-white flex items-center gap-2 mb-4">
            <AiOutlinePicture /> Add Image
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={handleSubmit}
            className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg"
            disabled={loading}>
            {loading ? "Sending..." : "Send Notification"}
          </button>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="bg-[#0d0d0d] w-1/3 shadow-md rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Device Preview</h3>
          <div className="border border-gray-700 rounded-lg p-4">
            <div className="flex justify-between text-sm mb-4">
              <span>Organisation Name</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
            <h4 className="text-lg font-semibold mb-2">
              {title || "Notification title"}
            </h4>
            <p className="text-gray-400">{text || "Notification text"}</p>
            {image && (
              <img
                src={image}
                alt="Preview"
                className="w-full h-24 object-cover rounded-lg mt-4"
              />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0d0d0d] w-[695px] h-[494px] shadow-lg rounded-lg relative">
            <button
              className="absolute top-4 right-4 text-white text-xl font-bold"
              onClick={toggleModal}>
              &times;
            </button>

            <div className="flex h-full">
              <div className="w-48 flex flex-col py-4">
                {menuItems.map((item) => (
                  <div
                    key={item}
                    className={`px-4 py-2 text-white cursor-pointer hover:bg-blue-100 hover:text-black ${
                      activeTab === item ? "bg-gray-700" : ""
                    }`}
                    onClick={() => setActiveTab(item)}>
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  Select Recipients
                </h3>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search"
                  className="w-full border border-gray-700 bg-gray-700 text-white rounded-lg px-3 py-2 mb-4"
                />
                <div className="max-h-60 overflow-y-auto">
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      className="px-3 py-2 bg-gray-700 rounded-lg mb-2 flex justify-between items-center cursor-pointer"
                      onClick={() => addRecipient(course)}>
                      <span>{course.title}</span>
                      <input
                        type="checkbox"
                        checked={recipients.includes(course)}
                        readOnly
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={toggleModal}
                  className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg">
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
