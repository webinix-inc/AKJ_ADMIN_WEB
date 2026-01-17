import React, { useEffect, useState, lazy, Suspense, memo, useCallback } from "react";
import "react-circular-progressbar/dist/styles.css";
import HOC from "../../Component/HOC/HOC";
import "./Home.css";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import UpcomingLiveClasses from "./UpcomingLiveClasses";

// Lazy load heavy components
const AllClasses = lazy(() => import("./AllClasses"));
const CreateLiveClass = lazy(() => import("./CreateLiveClass"));

// Lightweight Drawer component (replaces heavy react-bootstrap Offcanvas)
const Drawer = memo(({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="drawer-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.6)',
          zIndex: 1040,
        }}
      />
      {/* Drawer */}
      <div
        className="drawer-content"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '400px',
          maxWidth: '100vw',
          background: '#0d0d0d',
          zIndex: 1050,
          overflowY: 'auto',
        }}
      >
        {children}
      </div>
    </>
  );
});

// Memoized message item for performance
const MessageItem = memo(({ msgUser, onClick }) => (
  <div className="home21" onClick={onClick}>
    <div className="home222">
      <div className="home22">
        <p>{msgUser.firstName?.slice(0, 2).toUpperCase()}</p>
      </div>
      <div className="home23">
        <h6>{msgUser.firstName}</h6>
        <p>
          {msgUser.lastMessage?.length > 40
            ? msgUser.lastMessage.slice(0, 40) + "..."
            : msgUser.lastMessage || "No message"}
        </p>
      </div>
    </div>
    <div className="home25">
      <p>
        {msgUser.lastMessageTime ? new Date(msgUser.lastMessageTime).toLocaleTimeString(
          [], { hour: "2-digit", minute: "2-digit" }
        ) : "--:--"}
      </p>
    </div>
  </div>
));

const Home = () => {
  const [recentMessages, setRecentMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const navigate = useNavigate();

  const [show, setShow] = useState(false);
  const [show1, setShow1] = useState(false);

  // Fetch recent chats
  useEffect(() => {
    const controller = new AbortController();

    const fetchRecentChats = async () => {
      try {
        const res = await api.get("/chat/users/withMessages", {
          params: { page: 1, limit: 6 },
          signal: controller.signal
        });
        setRecentMessages(res.data.users || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error("Failed to load recent messages", err);
        }
      } finally {
        setMessagesLoading(false);
      }
    };

    fetchRecentChats();
    return () => controller.abort();
  }, []);

  const handleClose = useCallback(() => setShow(false), []);
  // eslint-disable-next-line no-unused-vars
  const handleShow = useCallback(() => setShow(true), []);
  const handleClose1 = useCallback(() => setShow1(false), []);
  const handleShow1 = useCallback(() => setShow1(true), []);
  const handleNavigateToMessages = useCallback(() => navigate("/messages"), [navigate]);

  return (
    <div className="home">
      <div className="home1">
        <div className="home2">
          {/* Welcome Banner - Lightweight */}
          <div className="home3">
            <div className="home4">
              <div className="home5 mt-4 sm:mt-6">
                <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">
                  Welcome back to AKJ Classes
                </h1>
                <span style={{ fontSize: '40px' }}>👋</span>
              </div>
            </div>
            <div className="home7 hidden sm:block">
              <span style={{ fontSize: '80px' }}>📚</span>
            </div>
          </div>

          {/* Messages Section */}
          <div className="home8 mt-0">
            <div className="home18">
              <div className="home19 flex justify-between items-center">
                <p className="text-base sm:text-lg font-semibold text-white m-0">
                  Recent Messages
                </p>
                <span className="cursor-pointer" onClick={handleNavigateToMessages}>
                  View All
                </span>
              </div>

              <div className="home20">
                {messagesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : recentMessages.length > 0 ? (
                  recentMessages.map((msgUser) => (
                    <MessageItem
                      key={msgUser._id}
                      msgUser={msgUser}
                      onClick={handleNavigateToMessages}
                    />
                  ))
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">💬</div>
                    <p className="empty-state-title">No recent messages</p>
                    <p className="empty-state-description">
                      Start a conversation with your students
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Live Classes Section */}
        <div className="home32">
          <div className="bg-transparent p-5 sm:p-6 rounded-2xl h-fit">
            <div className="flex text-white justify-between items-center mb-5 pb-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-lg sm:text-xl font-bold m-0 flex items-center gap-2">
                <span>📅</span>
                Upcoming Classes
              </p>
              <span
                onClick={handleShow1}
                className="text-blue-400 cursor-pointer hover:text-blue-300 text-sm font-semibold px-3 py-1.5 rounded-lg"
                style={{ border: '1px solid rgba(59, 130, 246, 0.3)', background: 'rgba(59, 130, 246, 0.1)' }}
              >
                + Create
              </span>
            </div>

            <div className="space-y-4">
              <UpcomingLiveClasses />
            </div>
          </div>
        </div>

        {/* Lightweight Drawers - replaces heavy react-bootstrap Offcanvas */}
        <Drawer show={show} onClose={handleClose}>
          <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
            <AllClasses handleClose={handleClose} handleshow={handleShow1} />
          </Suspense>
        </Drawer>

        <Drawer show={show1} onClose={handleClose1}>
          <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
            <CreateLiveClass handleClose={handleClose1} />
          </Suspense>
        </Drawer>
      </div>
    </div>
  );
};

export default HOC(Home);
