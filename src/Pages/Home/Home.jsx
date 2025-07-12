import React, { useState, useEffect } from "react";
import "./Home.css";
import HOC from "../../Component/HOC/HOC";
import "react-circular-progressbar/dist/styles.css";
import Offcanvas from "react-bootstrap/Offcanvas";

import img from "../../Image/img4.png";
import img1 from "../../Image/img5.png";

import AllClasses from "./AllClasses";
import CreateLiveClass from "./CreateLiveClass";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
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
        <div className="home1">
          <div className="home2">
            <div className="home3">
              <div className="home4">
                <div className="home5 mt-6">
                  <h1>Welcome back to AKJ Platform</h1>
                  <img src={img} alt="" />
                </div>
              </div>
              <div className="home7">
                <img src={img1} alt="" />
              </div>
            </div>

            {/* Messages Section */}
            <div className="home8 mt-5">
              <div className="home18">
                <div
                  className="home19"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <p style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                    Messages
                  </p>
                  <span
                    style={{
                      cursor: "pointer",
                      color: "#1A85FF",
                      fontSize: "14px",
                    }}
                    onClick={() => navigate("/messages")}
                  >
                    View All
                  </span>
                </div>

                <div
                  className="home20"
                  style={{ maxHeight: "360px", overflowY: "auto" }}
                >
                  {recentMessages.map((msgUser) => (
                    <div
                      key={msgUser._id}
                      className="home21 cursor-pointer"
                      onClick={() => navigate("/messages")}
                    >
                      <div className="home222">
                        <div
                          className="home22"
                          style={{ backgroundColor: "#1A85FF" }}
                        >
                          <p>{msgUser.firstName?.slice(0, 2).toUpperCase()}</p>
                        </div>
                        <div className="home23">
                          <h6>{msgUser.firstName}</h6>
                          <p>
                            {msgUser.lastMessage?.length > 40
                              ? msgUser.lastMessage.slice(0, 40) + "..."
                              : msgUser.lastMessage}
                          </p>
                        </div>
                      </div>
                      <div className="home25">
                        <p>
                          {new Date(msgUser.lastMessageTime).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* End Messages Section */}
          </div>

          {/* Upcoming Live Classes Section */}
          <div className="home32">
            <div className="bg-[#141414] p-6 rounded-lg shadow-md max-w-4xl mx-auto">
              <div className="flex text-white justify-between items-center mb-4">
                <p className="text-xl font-bold">Upcoming Classes</p>
                <span
                  onClick={handleShow1}
                  className="text-blue-600 cursor-pointer hover:underline"
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
