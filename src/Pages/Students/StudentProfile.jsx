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
    image
  } = studentDetails;

  console.log("Show all user profile details:", studentDetails);

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
                }}>
                {getInitials(firstName + lastName)}
              </div>
            )}
          </div>
          <div className="studentprofile3 text-white">
            <h6 className=" text-white">{`${firstName} ${lastName}`}</h6>
            <h5 className=" text-white">{email}</h5>
          </div>
        </div>
        <div className="studentprofile4">
          <FaArrowLeft size={30} onClick={() => navigate("/students")} />
        </div>
      </div>

      <div className="studentprofile5">
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
          <input type="text" value={email || ""} readOnly />
        </div>
        <div className="studentprofile6">
          <label>Phone Number</label>
          <input type="text" value={phone || ""} readOnly />
        </div>
      </div>
    </div>
  );
};

export default HOC(StudentProfile);
