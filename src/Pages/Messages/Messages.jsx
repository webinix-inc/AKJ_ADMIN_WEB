import dayjs from "dayjs";
import EmojiPicker from "emoji-picker-react";
import React, { useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { FaSearch, FaBars, FaComments } from "react-icons/fa";
import { FaMinus, FaPlus } from "react-icons/fa6";
import { IoIosArrowForward, IoMdDoneAll } from "react-icons/io";
import { IoLinkOutline } from "react-icons/io5";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import img2 from "../../Image/img3.png";
import "./Messages.css";

// Centralized socket configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8890/";

const socket = io(SOCKET_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5,
  timeout: 20000,
  forceNew: false,
  multiplex: true,
});

// ===== Memoized Components =====

// User List Item Component
const UserListItem = memo(({ user, isActive, onClick, formatTimeAgo, truncateText }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const displayName = useMemo(() => {
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    return user.userType === 'ADMIN' ? 'AKJ Classes Admin' : user.userType;
  }, [user.firstName, user.lastName, user.userType]);

  return (
    <div
      className={`user-item ${isActive ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="user-avatar">
        {!imageLoaded && <div className="avatar-skeleton" />}
        <img
          src={user.image || img2}
          alt={displayName}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>
      <div className="user-info">
        <div className="user-info-top">
          <span className="user-name">{displayName}</span>
          {user.lastMessageTime && (
            <span className="message-time">{formatTimeAgo(user.lastMessageTime)}</span>
          )}
        </div>
        <div className="user-info-bottom">
          <span className="last-message">
            {/* Only show tick indicator for messages YOU sent */}
            {user.isLastMessageSentByMe && (
              <span className={`read-indicator ${user.unreadCount > 0 ? 'unread' : 'read'}`}>
                <IoMdDoneAll size={16} />
              </span>
            )}
            {truncateText(user.lastMessage || user.phone, 6)}
          </span>
          {user.unreadCount > 0 && (
            <span className="unread-badge">{user.unreadCount}</span>
          )}
        </div>
      </div>
    </div>
  );
});

UserListItem.displayName = 'UserListItem';

// Message Bubble Component
const MessageBubble = memo(({ msg, isOutgoing, formatTimestamp }) => {
  return (
    <div className={`message-row ${isOutgoing ? 'outgoing' : 'incoming'}`}>
      <div className={`message-bubble ${isOutgoing ? 'outgoing' : 'incoming'}`}>
        {msg.attachments && msg.attachments.length > 0 ? (
          <div className="attachment-container">
            {msg.attachments.map((file, i) => {
              const isImage = file.mimeType?.startsWith("image/");
              const isVideo = file.mimeType?.startsWith("video/");
              const isPDF = file.mimeType === "application/pdf";
              const isDocument = file.mimeType?.includes("document") ||
                file.mimeType?.includes("word") ||
                file.mimeType?.includes("excel") ||
                file.mimeType?.includes("powerpoint");

              return (
                <div key={i} className="attachment-item">
                  {isImage ? (
                    <div>
                      <img
                        src={file.url}
                        alt={file.filename}
                        className="attachment-image"
                        loading="lazy"
                        onClick={() => window.open(file.url, '_blank')}
                        onError={(e) => {
                          console.error('Image failed to load:', file.url);
                          e.target.style.display = 'none';
                        }}
                      />
                      <p className="attachment-name">{file.filename}</p>
                    </div>
                  ) : isVideo ? (
                    <div>
                      <video
                        src={file.url}
                        controls
                        className="attachment-video"
                      />
                      <p className="attachment-name">{file.filename}</p>
                    </div>
                  ) : isPDF ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-file"
                    >
                      <span className="attachment-icon">📄</span>
                      <div className="attachment-info">
                        <p className="attachment-name">{file.filename}</p>
                        <p className="attachment-size">PDF • {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </a>
                  ) : isDocument ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-file"
                    >
                      <span className="attachment-icon">📋</span>
                      <div className="attachment-info">
                        <p className="attachment-name">{file.filename}</p>
                        <p className="attachment-size">Document • {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </a>
                  ) : (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="attachment-file"
                    >
                      <span className="attachment-icon">📎</span>
                      <div className="attachment-info">
                        <p className="attachment-name">{file.filename}</p>
                        <p className="attachment-size">File • {(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        ) : msg.content ? (
          <p className="message-content">{msg.content}</p>
        ) : null}
        <div className="message-meta">
          <span className="message-time-stamp">{formatTimestamp(msg.createdAt)}</span>
          {isOutgoing && (
            <span className="message-status">{msg.isRead || msg.read ? "✓✓" : "✓"}</span>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

// Chat Header Component
const ChatHeader = memo(({ user, onAvatarClick, onBackClick, showBackButton }) => {
  const displayName = useMemo(() => {
    if (user.firstName) {
      return user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
    }
    return user.userType === 'ADMIN' ? 'AKJ Classes Admin' : user.userType;
  }, [user.firstName, user.lastName, user.userType]);

  return (
    <div className="chat-header">
      {showBackButton && (
        <button className="mobile-menu-btn" onClick={onBackClick}>
          <FaBars size={20} />
        </button>
      )}
      <img
        onClick={onAvatarClick}
        src={user.image || img2}
        alt={displayName}
        className="chat-header-avatar"
      />
      <div className="chat-header-info">
        <p className="chat-header-name">{displayName}</p>
        <p className="chat-header-phone">{user.phone}</p>
      </div>
    </div>
  );
});

ChatHeader.displayName = 'ChatHeader';

// ===== Main Component =====
const Messages = () => {
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeUserId, setActiveUserId] = useState(null); // Track by user ID instead of index
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [data, setData] = useState([]);
  const [socketConnected, setSocketConnected] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // Typing indicator state
  const [typingUser, setTypingUser] = useState(null); // Who is typing
  const [sendingMessage, setSendingMessage] = useState(false); // Message sending state
  // eslint-disable-next-line no-unused-vars
  const [unreadNotifications, setUnreadNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem("unreadNotifications");
    return storedNotifications ? JSON.parse(storedNotifications) : {};
  });

  const navigate = useNavigate();

  const limitOnUser = 100;
  const currentUserId = useSelector(
    (state) => state.admin.adminData.data.userId
  );

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter users based on debounced search
  useEffect(() => {
    const filtered = users?.filter((user) =>
      user?.phone?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      user?.firstName?.toLowerCase().includes(debouncedSearch?.toLowerCase()) ||
      user?.lastName?.toLowerCase().includes(debouncedSearch?.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [debouncedSearch, users]);

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const normalizeMessages = useCallback((msgs = []) =>
    msgs.map((msg) => ({
      ...msg,
      createdAt: msg.createdAt || msg.timestamp || new Date().toISOString(),
    })), []);

  const sortMessages = useCallback((msgs) =>
    [...msgs].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    ), []);

  // Helper function to move user to top of the list when a message is sent/received
  const moveUserToTop = useCallback((userId, lastMessage, lastMessageTime) => {
    setData(prevData => {
      const userIndex = prevData.findIndex(u => u._id === userId);
      if (userIndex === -1) return prevData;

      const user = {
        ...prevData[userIndex],
        lastMessage: lastMessage,
        lastMessageTime: lastMessageTime || new Date().toISOString()
      };
      const newData = [user, ...prevData.filter(u => u._id !== userId)];
      return newData;
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  // Join the current user's room on mount to receive real-time messages
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join", currentUserId);
      console.log("Admin joined socket room:", currentUserId);
    }

    return () => {
      // Cleanup handled by socket disconnect
    };
  }, [currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      setMessages([]);
      setCursor(null);
      fetchMessages(selectedUser._id);
    }

    // Socket connection monitoring
    const handleConnect = () => {
      console.log('Admin socket connected');
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      console.log('Admin socket disconnected');
      setSocketConnected(false);
    };

    const handleConnectError = (error) => {
      console.error('Admin socket connection error:', error);
      setSocketConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    socket.on("message", (messageData) => {
      if (!messageData || !selectedUser) return;

      // Don't add messages that we sent ourselves (already added via optimistic update)
      // Check if the sender is the current user - if so, the message was already added
      if (messageData.sender === currentUserId || messageData.sender?.toString() === currentUserId?.toString()) {
        // This is our own message coming back from the server
        // Update the temp message with the real ID if needed
        setMessages((prevMessages) => {
          // Find the temp message by content and approximate time
          const existingIndex = prevMessages.findIndex(msg =>
            msg._id?.toString().startsWith('temp-') &&
            msg.content === messageData.content
          );

          if (existingIndex !== -1) {
            // Replace temp message with real one
            const updated = [...prevMessages];
            updated[existingIndex] = {
              ...normalizeMessages([messageData])[0],
              status: 'sent'
            };
            return updated;
          }
          return prevMessages;
        });
        return;
      }

      // Check if message is from the currently selected user
      const isFromSelectedUser = selectedUser &&
        (messageData.sender === selectedUser._id ||
          messageData.sender?.toString() === selectedUser._id?.toString());

      if (isFromSelectedUser) {
        // Message from currently selected user - add to messages
        setMessages((prevMessages) => {
          const exists = prevMessages.some(msg =>
            msg._id === messageData._id ||
            msg._id?.toString() === messageData._id?.toString()
          );
          if (exists) return prevMessages;
          return sortMessages([...prevMessages, ...normalizeMessages([messageData])]);
        });

        // Move user to top of list when receiving a message
        moveUserToTop(selectedUser._id, messageData.content, messageData.createdAt);
      } else {
        // Message from a user that is NOT currently selected
        // Increment their unread count
        const senderId = messageData.sender?.toString() || messageData.sender;

        setData((prevData) => {
          const userIndex = prevData.findIndex(u =>
            u._id === senderId || u._id?.toString() === senderId
          );

          if (userIndex !== -1) {
            // User exists in the list - increment unread count and move to top
            const user = {
              ...prevData[userIndex],
              unreadCount: (prevData[userIndex].unreadCount || 0) + 1,
              lastMessage: messageData.content,
              lastMessageTime: messageData.createdAt || new Date().toISOString()
            };
            return [user, ...prevData.filter(u => u._id !== senderId && u._id?.toString() !== senderId)];
          }

          // User not in list - could be a new conversation
          // The user list will refresh on next fetchUsers call
          return prevData;
        });
      }
    });

    socket.on("readReceipt", (messageId) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, read: true } : msg
        )
      );
    });

    // Typing indicator listener
    socket.on("userTyping", ({ userId, isTyping: typing }) => {
      if (selectedUser && userId === selectedUser._id) {
        setIsTyping(typing);
        setTypingUser(typing ? selectedUser : null);
      }
    });

    setSocketConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("message");
      socket.off("readReceipt");
      socket.off("userTyping");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser, currentUserId, normalizeMessages, sortMessages]);

  const fetchMessages = async (receiverId, cursor = null) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/chat/${receiverId}`, {
        params: { cursor, limit: 10 },
      });
      const {
        data: { data: fetchedMessages, nextCursor },
      } = response;

      const normalized = normalizeMessages(fetchedMessages).reverse();

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

  const handleUserClick = useCallback(async (user) => {
    setActiveUserId(user._id);
    setSelectedUser(user);
    setIsTyping(false); // Reset typing indicator
    setTypingUser(null);

    try {
      await api.get(`/chat/markAsRead/${user._id}`);
      setData(prevData =>
        prevData.map(u =>
          u._id === user._id
            ? { ...u, unreadCount: 0 }
            : u
        )
      );
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || sendingMessage) return;

    setSendingMessage(true);

    // Stop typing indicator
    socket.emit("typing", { receiverId: selectedUser._id, isTyping: false });

    const messageToSend = {
      _id: `temp-${Date.now()}`,
      content: newMessage,
      sender: currentUserId,
      receiver: selectedUser._id,
      receiverId: selectedUser._id,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'sending'
    };

    // Optimistic update
    setMessages((prevMessages) =>
      sortMessages([...prevMessages, messageToSend])
    );

    // Emit via socket for real-time
    socket.emit("message", messageToSend);

    try {
      const response = await api.post("/chat/send", {
        receiverId: selectedUser._id,
        message: newMessage,
      });

      // Update with real message ID from server
      if (response.data?.data?._id) {
        setMessages((prevMessages) =>
          prevMessages.map(msg =>
            msg._id === messageToSend._id
              ? { ...msg, _id: response.data.data._id, status: 'sent' }
              : msg
          )
        );
      }

      // Move user to top of list with updated last message
      moveUserToTop(selectedUser._id, newMessage, new Date().toISOString());

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      // Mark message as failed, don't remove it
      setMessages((prevMessages) =>
        prevMessages.map(msg =>
          msg._id === messageToSend._id
            ? { ...msg, status: 'failed' }
            : msg
        )
      );
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, currentUserId, selectedUser, sortMessages, sendingMessage, moveUserToTop]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const handleLoadMoreMessages = useCallback(() => {
    if (cursor && !loadingMessages) {
      fetchMessages(selectedUser._id, cursor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, loadingMessages, selectedUser]);

  const handleEmojiClick = useCallback((emojiObject) => {
    setNewMessage((prevMessage) => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (selectedUser) scrollToBottom();
  }, [messages, selectedUser, scrollToBottom]);

  const formatTimestamp = useCallback((timestamp) => dayjs(timestamp).format("h:mm A"), []);
  const formatDate = useCallback((timestamp) => dayjs(timestamp).format("MMMM D, YYYY"), []);

  // Fetch users with messages on mount
  useEffect(() => {
    const fetchUsersWithMessages = async () => {
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
    fetchUsersWithMessages();
  }, []);

  const formatTimeAgo = useCallback((timestamp) => {
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
  }, []);

  const truncateText = useCallback((text, wordLimit) => {
    if (!text) return "";
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  }, []);

  const handleFileChange = useCallback(async (e) => {
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
      e.target.value = "";
    }
  }, [selectedUser]);

  // Memoized message rendering
  const renderedMessages = useMemo(() => {
    const elements = [];
    let lastDate = null;

    messages.forEach((msg) => {
      const messageDate = formatDate(msg.createdAt);

      if (messageDate !== lastDate) {
        elements.push(
          <div key={`date-${msg.createdAt}`} className="date-separator">
            <span>{messageDate}</span>
          </div>
        );
        lastDate = messageDate;
      }

      const isOutgoingMessage = selectedUser &&
        msg.receiver === selectedUser._id &&
        msg.sender !== selectedUser._id;

      elements.push(
        <MessageBubble
          key={msg._id}
          msg={msg}
          isOutgoing={isOutgoingMessage}
          formatTimestamp={formatTimestamp}
        />
      );
    });

    return elements;
  }, [messages, selectedUser, formatDate, formatTimestamp]);

  // Current user list based on expanded state AND search query
  const currentUserList = useMemo(() => {
    const sourceList = isExpanded ? users : data;
    if (!debouncedSearch) return sourceList;

    return sourceList.filter((user) =>
      user?.phone?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user?.firstName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user?.lastName?.toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [isExpanded, users, data, debouncedSearch]);

  return (
    <div className={`messages-page ${selectedUser ? 'chat-open' : ''}`}>
      {/* Sidebar */}
      <div className="messages-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-header-top">
            <h2 className="sidebar-title">
              Messages
              <span
                className={`connection-indicator ${socketConnected ? 'connected' : 'disconnected'}`}
                title={socketConnected ? 'Connected' : 'Disconnected'}
              />
            </h2>
            <div className="sidebar-actions">
              <button className="icon-btn" onClick={handleToggleExpand} title={isExpanded ? 'Show recent' : 'Show all'}>
                {isExpanded ? <FaMinus size={14} /> : <FaPlus size={14} />}
              </button>
            </div>
          </div>

          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        <div className="user-list">
          {currentUserList.length > 0 ? (
            currentUserList.map((user) => (
              <UserListItem
                key={user._id}
                user={user}
                isActive={activeUserId === user._id}
                onClick={() => handleUserClick(user)}
                formatTimeAgo={formatTimeAgo}
                truncateText={truncateText}
              />
            ))
          ) : (
            <div className="empty-users">
              <FaComments className="empty-users-icon" />
              <p>No conversations yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        {selectedUser ? (
          <>
            <ChatHeader
              user={selectedUser}
              onAvatarClick={() => navigate(`/students/studentprofile/${selectedUser._id}`)}
              onBackClick={() => setSelectedUser(null)}
              showBackButton={true}
            />

            <div className="messages-container" onScroll={handleLoadMoreMessages}>
              {loadingMessages && (
                <div className="loading-messages">
                  <div className="loading-spinner" />
                </div>
              )}
              {renderedMessages}
              {isTyping && typingUser && (
                <div className="typing-indicator">
                  <span className="typing-text">{typingUser.firstName || 'User'} is typing</span>
                  <span className="typing-dots">
                    <span>.</span><span>.</span><span>.</span>
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="message-input-container">
              <div className="message-input-wrapper">
                <div className="message-input-field">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="message-input"
                  />
                  <div className="input-actions">
                    <input
                      type="file"
                      id="fileUpload"
                      multiple
                      hidden
                      onChange={handleFileChange}
                    />
                    <label htmlFor="fileUpload" className="input-action-btn">
                      <IoLinkOutline size={20} title="Attach file" />
                    </label>
                    <button
                      className="input-action-btn"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      <BsEmojiSmile size={20} />
                    </button>
                  </div>
                  {showEmojiPicker && (
                    <div className="emoji-picker-container">
                      <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
                    </div>
                  )}
                </div>
                <button onClick={handleSendMessage} className="send-btn">
                  <IoIosArrowForward size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <FaComments className="chat-placeholder-icon" />
            <p className="chat-placeholder-text">Select a conversation to start chatting</p>
            <button
              className="mobile-menu-btn"
              onClick={() => setSidebarOpen(true)}
              style={{ background: '#3b82f6', padding: '12px 24px', borderRadius: '8px', marginTop: '16px' }}
            >
              View Conversations
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HOC(Messages);
