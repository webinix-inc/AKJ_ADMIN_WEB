import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import { FaArrowLeft } from "react-icons/fa6";
import api from "../../api/axios";
import "./Students.css";

const StudentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [studentDetails, setStudentDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentDetails = async () => {
      try {
        const response = await api.get(`/admin/getProfile/${id}`);
        console.log("this is the response for student/:id page :", response);
        if (response.status === 200) {
          setStudentDetails(response.data.data);
        } else {
          console.error("Failed to fetch student details");
        }
      } catch (error) {
        console.error("Error fetching student details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDetails();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "NA";
    const initials = name?.split(" ").map((n) => n[0]);
    return initials?.length > 1
      ? initials[0] + initials[1]
      : initials[0] || "NA";
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!studentDetails) {
    return <p>Student details not found</p>;
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    image,
    createdAt,
    purchasedCourses,
  } = studentDetails;

  return (
    <div className="students">
      <div className="studentprofile">
        <div className="studentprofile1">
          <div className="studentprofile2">
            {image ? (
              <img
                src={image}
                alt={firstName}
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#ddd",
                  color: "#555",
                  fontWeight: "bold",
                }}
              >
                {getInitials(firstName + lastName)}
              </div>
            )}
          </div>
          <div className="studentprofile3 text-white">
            <h6 className="text-white">{`${firstName} ${lastName}`}</h6>
            <h5 className="text-white">{email}</h5>
          </div>
        </div>
        <div className="studentprofile4">
          <FaArrowLeft
            size={30}
            color="white"
            onClick={() => navigate("/students")}
          />
        </div>
      </div>

      {/* Student Details */}
      <div style={{ marginTop: "130px" }}>
        <h5 className="text-white text-3xl">Basic Details</h5>
        <div className="studentprofile5" style={{ marginTop: "20px" }}>
          <div className="studentprofile6">
            <label>First Name</label>
            <input type="text" value={firstName || ""} readOnly />
          </div>
          <div className="studentprofile6">
            <label>Last Name</label>
            <input type="text" value={lastName || ""} readOnly />
          </div>
          <div className="studentprofile6">
            <label>Email</label>
            <input type="text" value={email || "Not Provided Yet"} readOnly />
          </div>
          <div className="studentprofile6">
            <label>Phone Number</label>
            <input type="text" value={phone || ""} readOnly />
          </div>
          <div className="studentprofile6">
            <label>Registration Date</label>
            <input
              type="text"
              value={
                createdAt ? new Date(createdAt).toLocaleDateString() : "N/A"
              }
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Purchased Courses */}
      <div className="studentprofile5 text-white" style={{ marginTop: "2rem" }}>
        <h5>Purchased Courses</h5>
        {purchasedCourses && purchasedCourses.length > 0 ? (
          purchasedCourses.map((course, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px solid #ccc",
                padding: "10px 0",
              }}
            >
              <span>
                <strong>{course?.course?.title || "Untitled Course"}</strong>
              </span>
              <span>
                Enrollment Date:{" "}
                {new Date(course.purchaseDate).toLocaleDateString()}
              </span>
            </div>
          ))
        ) : (
          <p>No purchased courses</p>
        )}
      </div>
    </div>
  );
};

export default HOC(StudentProfile);
