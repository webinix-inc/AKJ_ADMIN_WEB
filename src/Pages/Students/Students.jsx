import React, { useEffect, useState } from "react";
import HOC from "../../Component/HOC/HOC";
import "./Students.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Link } from "react-router-dom";
import api from "../../api/axios";

import { Pagination } from "antd";

const Students = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/admin/getAllProfile");
        if (response.status === 200) {
          // Filter only users with userType USER
          const filteredData = response.data.data.filter(
            (user) => user.userType === "USER"
          );
          setStudentsData(filteredData);
        } else {
          console.error("Failed to fetch students data");
        }
      } catch (error) {
        console.error("Error fetching students data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getInitials = (name) => {
    if (!name) return "NA";
    const initials = name.split(" ").map((n) => n[0]?.toUpperCase());
    return initials.length > 1
      ? initials[0] + initials[1]
      : initials[0] || "NA";
  };
  const filteredStudents = studentsData.filter((student) => {
    const fullName = (student.firstName + " " + student.lastName).toLowerCase();
    return (
      fullName.includes(searchTerm) ||
      student.email?.toLowerCase().includes(searchTerm) ||
      student.phone?.toLowerCase().includes(searchTerm)
    );
  });

  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );

  // const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

  return (
    <div className="students">
      <div className="students1" style={{ width: "90%" }}>
        {/* Add filter or search options here if needed */}
      </div>
      <div className="students3">
        <input
          type="text"
          placeholder="Search by name, email, or phone"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value.toLowerCase());
            setCurrentPage(1); // Reset to page 1 on new search
          }}
          style={{ padding: "8px", width: "300px", marginBottom: "20px" }}
        />

        <div className="students4">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>IMAGE</th>
                  <th>FULL NAME</th>
                  <th>EMAIL</th>
                  <th>Registration Date</th>
                  <th>PHONE NO.</th>
                </tr>
              </thead>
              <tbody>
                {/* {studentsData.length > 0 ? ( */}
                {currentStudents.length > 0 ? (
                  currentStudents.map((item, index) => (
                    <tr key={index}>
                      <td>
                        <Link
                          to={`/students/studentprofile/${item._id}`}
                          className="selfservice3"
                        >
                          <OverlayTrigger
                            placement="bottom"
                            overlay={
                              <Tooltip id={`tooltip-${index}`}>
                                <strong>Click to View Profile</strong>
                              </Tooltip>
                            }
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.fullName}
                                style={{
                                  width: "55px",
                                  height: "55px",
                                  borderRadius: "50%",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "55px",
                                  height: "55px",
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  backgroundColor: "#ddd",
                                  color: "#555",
                                  fontWeight: "bold",
                                }}
                              >
                                {getInitials(
                                  item.firstName + " " + item.lastName
                                )}
                              </div>
                            )}
                          </OverlayTrigger>
                        </Link>
                      </td>
                      <td>{item.firstName + " " + item.lastName || "N/A"}</td>
                      <td>{item.email || "N/A"}</td>
                      <td>
                        {item.createdAt
                          ? new Date(item.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{item.phone || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Pagination
            current={currentPage}
            pageSize={studentsPerPage}
            total={filteredStudents.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default HOC(Students);
