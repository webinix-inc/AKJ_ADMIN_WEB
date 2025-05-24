import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import "./Teachers.css";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import { Link, useNavigate } from "react-router-dom";
import { HiPlus } from "react-icons/hi";
import api from "../../api/axios";
import { Pagination } from "antd";

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    experience: "",
    year: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const teachersPerPage = 1;

  const [years, setYears] = useState([]);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const response = await api.get("/admin/getAllProfile");
        if (response.status === 200) {
          const teacherData = response.data.data.filter(
            (user) => user.userType === "TEACHER"
          );
          setTeachers(teacherData);

          // Extract unique years for filtering
          const uniqueYears = [
            ...new Set(teacherData.map((teacher) => teacher.year)),
          ].sort();
          setYears(uniqueYears);
        } else {
          console.error("Failed to fetch teacher data");
        }
      } catch (error) {
        console.error("Error fetching teacher data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setCurrentPage(1);
  };

  // Apply filters to teacher data
  const filteredTeachers = teachers.filter((teacher) => {
    return (
      (!filters.experience || teacher.experience === filters.experience) &&
      (!filters.year || teacher.year === filters.year)
    );
  });
  const indexOfLastTeacher = currentPage * teachersPerPage;
  const indexOfFirstTeacher = indexOfLastTeacher - teachersPerPage;
  const currentTeachers = filteredTeachers.slice(
    indexOfFirstTeacher,
    indexOfLastTeacher
  );

  const getInitials = (firstName, lastName) => {
    const initials =
      (firstName?.[0]?.toUpperCase() || "") +
      (lastName?.[0]?.toUpperCase() || "");
    return initials || "N/A";
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="students">
      {/* Filter Section */}
      <div className="students1">
        <div className="students2">
          <label htmlFor="experience">Experience</label>
          <select name="experience" onChange={handleFilterChange}>
            <option value="">All</option>
            <option value="01">01 Year</option>
            <option value="02">02 Years</option>
            <option value="03">03 Years</option>
            <option value="04">04 Years</option>
            <option value="05">05 Years</option>
            <option value="06">05+ Years</option>
          </select>
        </div>
        <div className="students2">
          <label htmlFor="year">Year</label>
          <select name="year" onChange={handleFilterChange}>
            <option value="">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="course-test6">
          <button onClick={() => navigate("/teachers/addteacher")}>
            <HiPlus color="#FFFFFF" size={20} />
            Add Teacher
          </button>
        </div>
      </div>

      {/* Teachers Table */}
      <div className="students3">
        <div className="students4">
          <table>
            <thead>
              <tr>
                <th>IMAGE</th>
                <th>FULL NAME</th>
                <th>EMAIL</th>
                <th>PHONE NO.</th>
                <th>EXPERIENCE</th>
                {/* <th>DOCUMENT UPLOAD</th> */}
              </tr>
            </thead>
            <tbody>
              {/* {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher) => ( */}
              {currentTeachers.length > 0 ? (
                currentTeachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>
                      <Link
                        to={`/teachers/teacherprofile/${teacher._id}`}
                        className="selfservice3"
                      >
                        <OverlayTrigger
                          placement="bottom"
                          overlay={
                            <Tooltip id={`tooltip-${teacher._id}`}>
                              <strong>Click to View Profile</strong>
                            </Tooltip>
                          }
                        >
                          {teacher.image ? (
                            <img
                              src={teacher.image}
                              alt={teacher.firstName + " " + teacher.lastName}
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
                              {getInitials(teacher.firstName, teacher.lastName)}
                            </div>
                          )}
                        </OverlayTrigger>
                      </Link>
                    </td>
                    <td>
                      {teacher.firstName + " " + teacher.lastName || "N/A"}
                    </td>
                    <td>{teacher.email || "N/A"}</td>
                    <td>{teacher.phone || "N/A"}</td>
                    <td>{teacher.experience || "N/A"}</td>
                    {/* <td>{teacher.document ? "Uploaded" : "Not Uploaded"}</td> */}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No teachers found</td>
                </tr>
              )}
            </tbody>
          </table>
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
            pageSize={teachersPerPage}
            total={filteredTeachers.length}
            onChange={(page) => setCurrentPage(page)}
            showSizeChanger={false}
          />
        </div>
      </div>
    </div>
  );
};

export default HOC(Teachers);
