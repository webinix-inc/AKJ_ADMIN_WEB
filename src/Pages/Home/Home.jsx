// import React, { useState, useEffect } from "react";
// import "./Home.css";
// import HOC from "../../Component/HOC/HOC";
// import ReactApexChart from "react-apexcharts";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import Offcanvas from "react-bootstrap/Offcanvas";

// import img from "../../Image/img4.png";
// import img1 from "../../Image/img5.png";
// import img2 from "../../Image/img6.png";
// import img3 from "../../Image/img7.png";
// import img4 from "../../Image/img8.png";

// import { GoImage } from "react-icons/go";
// import { TiArrowSortedDown } from "react-icons/ti";
// import { TiDocumentText } from "react-icons/ti";
// import { IoIosArrowForward } from "react-icons/io";
// import { GiPlainCircle } from "react-icons/gi";
// import { MdOutlineKeyboardArrowRight } from "react-icons/md";
// import AllClasses from "./AllClasses";
// import CreateLiveClass from "./CreateLiveClass";
// import { useNavigate } from "react-router-dom";
// import api from "../../api/axios";
// import UpcomingLiveClasses from "./UpcomingLiveClasses";

// const Home = () => {
//   const [upcomingClasses, setUpcomingClasses] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // Fetch upcoming classes from the API
//   useEffect(() => {
//     const fetchUpcomingClasses = async () => {
//       try {
//         const response = await api.get("/api/live-classes/upcoming");
//         setUpcomingClasses(response.data);
//       } catch (error) {
//         console.error("Error fetching upcoming classes:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUpcomingClasses();
//   }, []);

//   const percentage = 70;
//   const [series, setSeries] = useState([
//     {
//       name: "series1",
//       data: [31, 40, 28, 51, 42, 109, 100],
//     },
//   ]);

//   const [options, setOptions] = useState({
//     chart: {
//       height: 350,
//       type: "area",
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     stroke: {
//       curve: "smooth",
//     },
//     xaxis: {
//       type: "datetime",
//       categories: [
//         "2018-09-19T00:00:00.000Z",
//         "2018-09-19T01:30:00.000Z",
//         "2018-09-19T02:30:00.000Z",
//         "2018-09-19T03:30:00.000Z",
//         "2018-09-19T04:30:00.000Z",
//         "2018-09-19T05:30:00.000Z",
//         "2018-09-19T06:30:00.000Z",
//       ],
//     },
//     tooltip: {
//       x: {
//         format: "dd/MM/yy HH:mm",
//       },
//     },
//   });

//   const [show, setShow] = useState(false);
//   const handleClose = () => setShow(false);
//   const handleShow = () => setShow(true);

//   const [show1, setShow1] = useState(false);
//   const handleClose1 = () => setShow1(false);
//   const handleShow1 = () => setShow1(true);

//   const navigate = useNavigate();

//   return (
//     <>
//       <div className="home">
//         <div className="home1">
//           <div className="home2">
//             <div className="home3">
//               <div className="home4">
//                 <div className="home5 mt-6">
//                   <h1>Welcome back to AKJ Platform</h1>
//                   <img src={img} alt="" />
//                 </div>
//                 {/* <div className="home6">
//                   <p>
//                     You’ve learned <span>70% </span> of your goal this week!
//                     <br />
//                     Keep it up and improve your progeress.
//                   </p>
//                 </div> */}
//               </div>
//               <div className="home7">
//                 <img src={img1} alt="" />
//               </div>
//             </div>

//             {/* <div className="home8">
//               <div className="home9">
//                 <div className="home10">
//                   <p>Performance</p>
//                   <div className="home11">
//                     <p>Overall</p>
//                     <TiArrowSortedDown color="#1A85FF" size={20} />
//                   </div>
//                 </div>
//                 <div id="chart">
//                   <ReactApexChart
//                     options={options}
//                     series={series}
//                     type="area"
//                     height={300}
//                   />
//                 </div>
//               </div>
//               <div className="home12">
//                 <div className="home13">
//                   <p>Completion Progress</p>
//                 </div>
//                 <div className="home14">
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Life Contingency </p>
//                       <span>Chapter 3</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Social Insurance</p>
//                       <span>Chapter 4</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Advanced Maths.</p>
//                       <span>Module 2</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Pension</p>
//                       <span>Chapter 5</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Life Contingency </p>
//                       <span>Chapter 3</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                   <div className="home15">
//                     <div className="home16">
//                       <p>Life Contingency </p>
//                       <span>Chapter 3</span>
//                     </div>
//                     <div className="home17">
//                       <CircularProgressbar
//                         value={percentage}
//                         text={`${percentage}%`}
//                         styles={buildStyles({
//                           textColor: "#D0CECE",
//                           pathColor: "#0077FF", // Use a solid color here
//                           trailColor: "#e6e6e6",
//                         })}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div> */}

//             <div className="home8 mt-5">
//               <div className="home18">
//                 <div className="home19">
//                   <p>Messages</p>
//                   <span onClick={() => navigate("/messages")}>View All</span>
//                 </div>
//                 <div className="home20">
//                   <div className="home21">
//                     <div className="home222">
//                       <div className="home22">
//                         <p>MA</p>
//                       </div>
//                       <div className="home23">
//                         <h6>Mayowa Ade</h6>
//                         <p>Hey! I just finished the first chapter</p>
//                         <div className="home26">
//                           <div className="home24">
//                             <TiDocumentText size={20} color="#1A85FF" />
//                             <p>First Chapter of Project .doc</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="home25">
//                       <p>09:34 am</p>
//                     </div>
//                   </div>
//                   <div className="home21">
//                     <div className="home222">
//                       <div
//                         className="home22"
//                         style={{ backgroundColor: "#FF3694" }}
//                       >
//                         <p>OT</p>
//                       </div>
//                       <div className="home23">
//                         <h6>Olawuyi Tobi</h6>
//                         <p>
//                           Can you check out the formulas in these Images att...
//                         </p>
//                         <div className="home26">
//                           <div className="home24">
//                             <GoImage size={20} color="#1A85FF" />
//                             <p>Image .jpg</p>
//                           </div>
//                           <div className="home24">
//                             <GoImage size={20} color="#1A85FF" />
//                             <p>Image .jpg</p>
//                           </div>
//                           <div className="home24">
//                             <GoImage size={20} color="#1A85FF" />
//                             <p>Image .jpg</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     <div className="home25">
//                       <p>09:34 am</p>
//                     </div>
//                   </div>
//                   <div className="home21">
//                     <div className="home222">
//                       <div
//                         className="home22"
//                         style={{ backgroundColor: "#19E742" }}
//                       >
//                         <p>JA</p>
//                       </div>
//                       <div className="home23">
//                         <h6>Joshua Ashiru</h6>
//                         <p>
//                           Dear Ayo, You are yet to submit your assignment for
//                           chapt...
//                         </p>
//                       </div>
//                     </div>

//                     <div className="home25">
//                       <p>09:34 am</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* <div className="home12">
//                 <div className="home13">
//                   <p>Top Performing Student</p>
//                 </div>
//                 <div className="home14">
//                   <div
//                     className="home27"
//                     style={{ backgroundColor: "#FFDD1A" }}
//                   >
//                     <div className="home28">
//                       <div
//                         className="home29"
//                         style={{ backgroundColor: "#19E742" }}
//                       >
//                         <p>JA</p>
//                       </div>
//                       <div className="home30">
//                         <h6 style={{ color: "#333333" }}>Joshua Ashiru</h6>
//                         <p style={{ color: "#333333" }}>9.6/10 points</p>
//                       </div>
//                     </div>
//                     <div className="home31">
//                       <img src={img2} alt="" />
//                     </div>
//                   </div>
//                   <div
//                     className="home27"
//                     style={{ backgroundColor: "#C0C0C0" }}
//                   >
//                     <div className="home28">
//                       <div
//                         className="home29"
//                         style={{ backgroundColor: "#1A85FF" }}
//                       >
//                         <p>AA</p>
//                       </div>
//                       <div className="home30">
//                         <h6 style={{ color: "#333333" }}>Adeola Ayo</h6>
//                         <p style={{ color: "#333333" }}>9/10 points</p>
//                       </div>
//                     </div>
//                     <div className="home31">
//                       <img src={img3} alt="" />
//                     </div>
//                   </div>
//                   <div
//                     className="home27"
//                     style={{ backgroundColor: "#DFB891" }}
//                   >
//                     <div className="home28">
//                       <div
//                         className="home29"
//                         style={{ backgroundColor: "#FF3694" }}
//                       >
//                         <p>OT</p>
//                       </div>
//                       <div className="home30">
//                         <h6 style={{ color: "#333333" }}>Olawuyi Tobi</h6>
//                         <p style={{ color: "#333333" }}>8.5/10 points</p>
//                       </div>
//                     </div>
//                     <div className="home31">
//                       <img src={img4} alt="" />
//                     </div>
//                   </div>
//                   <div className="home27">
//                     <div className="home28">
//                       <div className="home29">
//                         <p>MA</p>
//                       </div>
//                       <div className="home30">
//                         <h6>Mayowa Ade</h6>
//                         <p>7/10 points</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="home27">
//                     <div className="home28">
//                       <div className="home29">
//                         <p>MA</p>
//                       </div>
//                       <div className="home30">
//                         <h6>Mayowa Ade</h6>
//                         <p>7/10 points</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div> */}

//             </div>
//           </div>

//           <div className="home32">
//             <div className="bg-[#141414] p-6 rounded-lg shadow-md max-w-4xl mx-auto">
//               <div className="flex text-white justify-between items-center mb-4">
//                 <p className="text-xl font-bold">Upcoming Classes</p>
//                 <span
//                   onClick={handleShow1}
//                   className="text-blue-600 cursor-pointer hover:underline"
//                 >
//                   Create +
//                 </span>
//               </div>

//               <div className="space-y-4">
//                 <UpcomingLiveClasses />
//               </div>

//               {/* <div
//                 className="flex justify-between items-center mt-4 cursor-pointer"
//                 onClick={handleShow}
//               >
//                 <p className="text-blue-600">View All</p>
//                 <IoIosArrowForward color="#1A85FF" size={20} />
//               </div> */}
//             </div>

//             {/* <div className="home42">
//               <div className="home43">
//                 <p>Upcoming Activities</p>
//                 <span>See all</span>
//               </div>

//               <div className="home44">
//                 <div className="home45">
//                   <div className="home46">
//                     <div className="home47">
//                       <p>8</p>
//                     </div>
//                     <div className="home48">
//                       <h6>Life Contingency Tutorials</h6>
//                       <div className="home49">
//                         <p>8th - 10th July 2021</p>
//                         <GiPlainCircle color="#1A85FF" size={10} />
//                         <p>8 A.M - 9 A.M </p>
//                       </div>
//                       <p>Edulog Tutorial College, Blk 56, Lagos State.</p>
//                     </div>
//                     <div>
//                       <MdOutlineKeyboardArrowRight color="#D0CECE" size={25} />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="home45">
//                   <div className="home46">
//                     <div
//                       className="home47"
//                       style={{ backgroundColor: "#FF3694" }}
//                     >
//                       <p>13</p>
//                     </div>
//                     <div className="home48">
//                       <h6>Social Insurance Test</h6>
//                       <div className="home49">
//                         <p>13th July 2021</p>
//                         <GiPlainCircle color="#1A85FF" size={10} />
//                         <p>8 A.M - 9 A.M </p>
//                       </div>
//                       <p>School Hall, University Road, Lagos State</p>
//                     </div>
//                     <div>
//                       <MdOutlineKeyboardArrowRight color="#D0CECE" size={25} />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="home45">
//                   <div className="home46">
//                     <div
//                       className="home47"
//                       style={{ backgroundColor: "#19E742" }}
//                     >
//                       <p>13</p>
//                     </div>
//                     <div className="home48">
//                       <h6>Adv. Maths Assignment Due</h6>
//                       <div className="home49">
//                         <p>18th July 2021</p>
//                         <GiPlainCircle color="#1A85FF" size={10} />
//                         <p>8 A.M - 9 A.M </p>
//                       </div>
//                       <p>School Hall, University Road, Lagos State</p>
//                     </div>
//                     <div>
//                       <MdOutlineKeyboardArrowRight color="#D0CECE" size={25} />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="home45">
//                   <div className="home46">
//                     <div
//                       className="home47"
//                       style={{ backgroundColor: "#FF8F57" }}
//                     >
//                       <p>13</p>
//                     </div>
//                     <div className="home48">
//                       <h6>Dr. Dipo’s Tutorial Class</h6>
//                       <div className="home49">
//                         <p>23rd July 2021</p>
//                         <GiPlainCircle color="#1A85FF" size={10} />
//                         <p>8 A.M - 9 A.M </p>
//                       </div>
//                       <p>School Hall, University Road, Lagos State</p>
//                     </div>
//                     <div>
//                       <MdOutlineKeyboardArrowRight color="#D0CECE" size={25} />
//                     </div>
//                   </div>
//                 </div>
//                 <div className="home45">
//                   <div className="home46">
//                     <div
//                       className="home47"
//                       style={{ backgroundColor: "#FF8F57" }}
//                     >
//                       <p>13</p>
//                     </div>
//                     <div className="home48">
//                       <h6>Dr. Dipo’s Tutorial Class</h6>
//                       <div className="home49">
//                         <p>23rd July 2021</p>
//                         <GiPlainCircle color="#1A85FF" size={10} />
//                         <p>8 A.M - 9 A.M </p>
//                       </div>
//                       <p>School Hall, University Road, Lagos State</p>
//                     </div>
//                     <div>
//                       <MdOutlineKeyboardArrowRight color="#D0CECE" size={25} />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div> */}
//           </div>

//           <Offcanvas show={show} onHide={handleClose} placement="end">
//             <Offcanvas.Body className="allclass3" style={{ padding: 0 }}>
//               <AllClasses handleClose={handleClose} handleshow={handleShow1} />
//             </Offcanvas.Body>
//           </Offcanvas>
//           <Offcanvas show={show1} onHide={handleClose1} placement="end">
//             <Offcanvas.Body className="allclass3" style={{ padding: 0 }}>
//               <CreateLiveClass handleClose={handleClose1} />
//             </Offcanvas.Body>
//           </Offcanvas>
//         </div>
//       </div>
//     </>
//   );
// };

// export default HOC(Home);

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
