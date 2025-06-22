import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import img2 from "../../Image/img3.png";
import { IoLinkOutline } from "react-icons/io5";
import { BsEmojiSmile } from "react-icons/bs";
import { HiOutlineMicrophone } from "react-icons/hi";
import { IoIosArrowForward, IoMdCheckbox, IoMdDoneAll } from "react-icons/io";
import EmojiPicker from "emoji-picker-react";
import { useSelector } from "react-redux";
import "./Messages.css";
import dayjs from "dayjs";
import { FaSearch } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

// const socket = io("http://13.233.215.250:8889/", {
//   transports: ["websocket", "polling"],
// });
const socket = io("http://13.201.132.140:8889/", {
  transports: ["websocket", "polling"],
});

const Messages = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeIndex, setActiveIndex] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem("unreadNotifications");
    return storedNotifications ? JSON.parse(storedNotifications) : {};
  });

  const navigate = useNavigate();

  const limitOnUser = 100;
  const currentUserId = useSelector(
    (state) => state.admin.adminData.data.userId
  );

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const normalizeMessages = (msgs = []) =>
    msgs.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
    }));

  const sortMessages = (msgs) =>
    [...msgs].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filtered = users?.filter((user) =>
      user?.phone?.toLowerCase().includes(searchQuery?.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/chat/getUsersBasedOnRoles", {
        params: { page: 1, limitOnUser },
      });
      setUsers(response.data.users);
      setFilteredUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  console.log("User data print from admin panel show here:", users);

  useEffect(() => {
    if (selectedUser) {
      socket.emit("join", selectedUser._id);
      setMessages([]);
      setCursor(null);
      fetchMessages(selectedUser._id);
    }

    socket.on("message", (messageData) => {
      if (messageData && messageData.sender !== currentUserId) {
        setMessages((prevMessages) =>
          sortMessages([...prevMessages, ...normalizeMessages([messageData])])
        );
      }
    });

    socket.on("readReceipt", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    return () => {
      socket.off("message");
      socket.off("readReceipt");
    };
  }, [selectedUser, currentUserId]);

  const fetchMessages = async (receiverId, cursor = null) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/chat/${receiverId}`, {
        params: { cursor, limit: 10 },
      });

      const {
        data: { data: fetchedMessages, nextCursor },
      } = response;

      const normalized = normalizeMessages(fetchedMessages).reverse(); // reverse because backend sends latest first

      setMessages((prevMessages) =>
        sortMessages(cursor ? [...prevMessages, ...normalized] : normalized)
      );
      setCursor(nextCursor);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleUserClick = (index, user) => {
    setActiveIndex(index);
    setSelectedUser(user);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageToSend = {
      _id: Date.now(),
      content: newMessage,
      sender: currentUserId,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      read: false,
    };

    setMessages((prevMessages) =>
      sortMessages([...prevMessages, messageToSend])
    );

    socket.emit("message", messageToSend);

    try {
      await api.post("/chat/send", {
        receiverId: selectedUser._id,
        message: newMessage,
      });
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg._id !== messageToSend._id)
      );
    }
  };

  const handleLoadMoreMessages = () => {
    if (cursor && !loadingMessages) {
      fetchMessages(selectedUser._id, cursor);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (selectedUser) scrollToBottom();
  }, [messages, selectedUser]);

  const formatTimestamp = (timestamp) => dayjs(timestamp).format("h:mm A");
  const formatDate = (timestamp) => dayjs(timestamp).format("MMMM D, YYYY");

  const handleOutsideClick = (e) => {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setIsSearchOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // console.log("User data print from admin", users);

  console.log("Filter data print:", filteredUsers);

  // Fetch users on mount
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/chat/users/withMessages", {
          params: { page: 1, limit: 10 },
        });

        const usersWithUnread = response.data.users.reduce((acc, user) => {
          acc[user._id] = user.unreadCount || 0;
          return acc;
        }, {});

        setData(response.data.users);

        setUnreadNotifications((prev) => ({ ...prev, ...usersWithUnread }));
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  console.log("Data is printed from here:", data);
  const isRead = data.isRead;

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

    const timeFrames = [
      { label: "second", seconds: 1 },
      { label: "minute", seconds: 60 },
      { label: "hour", seconds: 3600 },
      { label: "day", seconds: 86400 },
      { label: "month", seconds: 2592000 },
      { label: "year", seconds: 31536000 },
    ];

    for (const { label, seconds } of timeFrames.reverse()) {
      const interval = Math.floor(diffInSeconds / seconds);
      if (interval >= 1) {
        return `${interval} ${label}${interval > 1 ? "s" : ""} ago`;
      }
    }

    return "Just now";
  };

  console.log("Selected User from message panel:", selectedUser);

  // Helper function to truncate text
  function truncateText(text, wordLimit) {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  }

  console.log("Message all content show here:", messages);

  console.log("Selected user print:", selectedUser);

  const handleFileChange = async (e) => {
    const files = e.target.files;
    if (!files.length || !selectedUser) return;

    const formData = new FormData();
    for (let file of files) {
      formData.append("attachments", file);
    }
    formData.append("receiverId", selectedUser._id);

    try {
      const res = await api.post("/chat/send", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { data: sentMessage } = res.data;

      setMessages((prev) => [...prev, sentMessage]);
      socket.emit("message", sentMessage);
    } catch (err) {
      console.error("Attachment upload failed:", err);
    } finally {
      e.target.value = ""; // reset input so user can reselect same file again
    }
  };

  return (
    <div className="flex h-[85vh] bg-[#141414] text-gray-100">
      <div className="w-1/3 border-r border-gray-700">
        {/* Header Section */}
        <div className="p-[30px] text-lg font-semibold bg-gray-800 flex justify-between shadow text-white relative">
          Messages
          <div className="flex items-center">
            <FaSearch
              className="text-gray-500 cursor-pointer"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            />

            {/* Toggle Section */}
            <div
              className=" p-1 ml-2 flex items-center justify-between bg-gray-800 text-white cursor-pointer"
              onClick={handleToggleExpand}
            >
              {isExpanded ? (
                <FaMinus className="text-white" />
              ) : (
                <FaPlus className="text-white" />
              )}
            </div>

            {isSearchOpen && (
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="absolute top-full -mt-7 left-0 w-full bg-gray-900 text-gray-100 border border-gray-700 rounded px-2 py-1 focus:outline-none"
              />
            )}
          </div>
        </div>

        {/* Conditional Rendering of User List */}
        {isExpanded ? (
          <div className="overflow-y-scroll h-[68vh]" id="scrollbar-hid">
            {filteredUsers.map((user, index) => (
              <div
                key={user._id}
                className={`p-4 cursor-pointer ${
                  activeIndex === index ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
                onClick={() => handleUserClick(index, user)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.image || img2}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold">
                      {user.firstName || user.userType}
                    </p>
                    <p className="text-sm text-gray-400">{user.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-y-scroll h-[68vh]" id="scrollbar-hid">
            {data.map((user, index) => (
              <div
                key={user._id}
                className={`p-4 cursor-pointer ${
                  activeIndex === index ? "bg-gray-700" : "hover:bg-gray-800"
                }`}
                onClick={() => handleUserClick(index, user)}
              >
                <div className="flex items-center space-x-3">
                  <img
                    src={user.image || img2}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <div className="flex justify-between">
                      <p className="font-semibold">
                        {user.firstName || user.userType}
                      </p>

                      <p className="font-md ml-9">
                        {formatTimeAgo(user.lastMessageTime)}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500 flex items-center">
                      <span className="ml-2 mr-2">
                        {isRead ? (
                          <IoMdCheckbox
                            className="text-blue-500"
                            title="Read"
                            size={18}
                          />
                        ) : (
                          <IoMdDoneAll
                            className="text-gray-400"
                            title="Unread"
                            size={18}
                          />
                        )}
                      </span>
                      {truncateText(user.lastMessage, 10)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col w-2/3 h-full">
        {selectedUser ? (
          <>
            <div className="p-4 bg-gray-800 shadow flex items-center space-x-4">
              <img
                onClick={() =>
                  navigate(`/students/studentprofile/${selectedUser._id}`)
                }
                src={selectedUser.image || img2}
                alt={selectedUser.mobile}
                className="w-10 h-10 rounded-full cursor-pointer"
              />
              <p className="text-lg font-semibold text-white">
                {selectedUser.firstName}
              </p>
              <p className="text-lg font-semibold text-white">
                {selectedUser.phone}
              </p>
            </div>

            <div
              id="scrollbar-hid"
              className="flex-1 p-4 overflow-y-auto scrollbar-hid bg-[#141414]"
              onScroll={handleLoadMoreMessages}
            >
              {messages.reduce((acc, msg, index, arr) => {
                const messageDate = formatDate(msg.createdAt);

                const prevDate =
                  index > 0 ? formatDate(arr[index - 1].createdAt) : null;

                if (messageDate !== prevDate) {
                  acc.push(
                    <div
                      key={`date-${msg.createdAt}`}
                      className="text-center my-4 text-sm text-gray-400"
                    >
                      {messageDate}
                    </div>
                  );
                }

                acc.push(
                  <div
                    key={msg._id}
                    className={`flex mb-2 ${
                      msg.sender === currentUserId
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`${
                        msg.sender === currentUserId
                          ? "bg-blue-600 text-white"
                          : "bg-gray-700 text-gray-100"
                      } max-w-[70%] p-3 rounded-lg`}
                    >
                      {msg.attachments && msg.attachments.length > 0 ? (
                        <div className="space-y-2">
                          {msg.attachments.map((file, i) => {
                            const isImage = file.mimeType?.startsWith("image/");
                            const isVideo = file.mimeType?.startsWith("video/");
                            return (
                              <div key={i}>
                                {isImage ? (
                                  <img
                                    src={file.url}
                                    alt={file.filename}
                                    className="w-40 rounded"
                                  />
                                ) : isVideo ? (
                                  <video
                                    src={file.url}
                                    controls
                                    className="w-48 rounded"
                                  />
                                ) : (
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                  >
                                    📎 {file.filename}
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                      <div className="text-xs text-gray-400 flex justify-between items-center mt-2">
                        <span>{formatTimestamp(msg.createdAt)}</span>
                        {msg.sender === currentUserId && (
                          <span className="ml-2">{msg.read ? "✓✓" : "✓"}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );

                return acc;
              }, [])}
              <div ref={messagesEndRef} />
            </div>

            <div className="flex ml-4 items-center ">
              <div className="relative flex items-center flex-grow">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="w-full py-2 px-4 rounded-full border border-gray-700 bg-gray-900 text-gray-100 focus:outline-none"
                />
                <div className="absolute right-2 flex items-center space-x-2">
                  {/* <IoLinkOutline
                    className="text-gray-500 cursor-pointer"
                    size={20}
                  /> */}
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    hidden
                    onChange={handleFileChange}
                  />

                  <label htmlFor="fileUpload" className="cursor-pointer">
                    <IoLinkOutline
                      className="text-gray-500 cursor-pointer"
                      size={20}
                      title="Attach file"
                    />
                  </label>
                  <BsEmojiSmile
                    className="text-gray-500 cursor-pointer"
                    size={20}
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  />
                  {/* <HiOutlineMicrophone
                    className="text-gray-500 cursor-pointer"
                    size={20}
                  /> */}
                </div>
              </div>
              <button
                onClick={handleSendMessage}
                className="ml-4 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700"
              >
                <IoIosArrowForward size={20} />
              </button>
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-4">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default HOC(Messages);
