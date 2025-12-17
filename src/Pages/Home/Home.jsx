import React, { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import "react-circular-progressbar/dist/styles.css";
import HOC from "../../Component/HOC/HOC";
import "./Home.css";

import img from "../../Image/img4.png";
import img1 from "../../Image/img5.png";

import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import AllClasses from "./AllClasses";
import CreateLiveClass from "./CreateLiveClass";
import UpcomingLiveClasses from "./UpcomingLiveClasses";

const Home = () => {
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecentChats = async () => {
      try {
        const res = await api.get("/chat/users/withMessages", {
          params: { page: 1, limit: 6 }, // fetch top 6 recent messages
        });
        setRecentMessages(res.data.users || []);
      } catch (err) {
        console.error("Failed to load recent messages", err);
      }
    };

    fetchRecentChats();
  }, []);

  useEffect(() => {
    const fetchUpcomingClasses = async () => {
      try {
        const response = await api.get("/api/live-classes/upcoming");
        setUpcomingClasses(response.data);
      } catch (error) {
        console.error("Error fetching upcoming classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingClasses();
  }, []);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [show1, setShow1] = useState(false);
  const handleClose1 = () => setShow1(false);
  const handleShow1 = () => setShow1(true);

  return (
    <>
      <div className="home">
        <div className="home1 flex-col lg:flex-row">
          <div className="home2 flex-1">
            {/* Welcome Banner */}
            <div className="home3">
              <div className="home4">
                <div className="home5 mt-6">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl">Welcome back to AKJ Classes</h1>
                  <img src={img} alt="Welcome" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              </div>
              <div className="home7 hidden sm:block">
                <img src={img1} alt="Banner" className="w-24 h-24 sm:w-32 sm:h-32" />
              </div>
            </div>

            {/* Messages Section */}
            <div className="home8 mt-5">
              <div className="home18">
                <div className="home19 flex justify-between items-center mb-4">
                  <p className="text-lg font-semibold text-white m-0">
                    Recent Messages
                  </p>
                  <span
                    className="text-blue-400 text-sm cursor-pointer hover:text-blue-300 transition-colors"
                    onClick={() => navigate("/messages")}
                  >
                    View All
                  </span>
                </div>

                <div className="home20 max-h-80 overflow-y-auto">
                  {recentMessages.length > 0 ? (
                    recentMessages.map((msgUser) => (
                      <div
                        key={msgUser._id}
                        className="home21 cursor-pointer hover:bg-gray-800 transition-colors rounded-lg p-2 -mx-2"
                        onClick={() => navigate("/messages")}
                      >
                        <div className="home222">
                          <div className="home22 bg-blue-500">
                            <p>{msgUser.firstName?.slice(0, 2).toUpperCase()}</p>
                          </div>
                          <div className="home23">
                            <h6 className="text-white">{msgUser.firstName}</h6>
                            <p className="text-gray-300 text-sm">
                              {msgUser.lastMessage?.length > 40
                                ? msgUser.lastMessage.slice(0, 40) + "..."
                                : msgUser.lastMessage || "No message"}
                            </p>
                          </div>
                        </div>
                        <div className="home25">
                          <p className="text-xs text-gray-400">
                            {msgUser.lastMessageTime ? new Date(msgUser.lastMessageTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            ) : "--:--"}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>No recent messages</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Live Classes Section */}
          <div className="home32 w-full lg:w-auto">
            <div className="bg-[#0d0d0d] p-6 rounded-lg shadow-md h-fit">
              <div className="flex text-white justify-between items-center mb-4">
                <p className="text-xl font-bold">Upcoming Classes</p>
                <span
                  onClick={handleShow1}
                  className="text-blue-400 cursor-pointer hover:text-blue-300 transition-colors text-sm"
                >
                  Create +
                </span>
              </div>

              <div className="space-y-4">
                <UpcomingLiveClasses />
              </div>
            </div>
          </div>

          {/* Side panels */}
          <Offcanvas show={show} onHide={handleClose} placement="end">
            <Offcanvas.Body className="allclass3" style={{ padding: 0 }}>
              <AllClasses handleClose={handleClose} handleshow={handleShow1} />
            </Offcanvas.Body>
          </Offcanvas>
          <Offcanvas show={show1} onHide={handleClose1} placement="end">
            <Offcanvas.Body className="allclass3" style={{ padding: 0 }}>
              <CreateLiveClass handleClose={handleClose1} />
            </Offcanvas.Body>
          </Offcanvas>
        </div>
      </div>
    </>
  );
};

export default HOC(Home);
