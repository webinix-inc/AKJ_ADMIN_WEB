import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HOC from "../../Component/HOC/HOC";
import { FaArrowLeft } from "react-icons/fa6";
import { MdFileDownload } from "react-icons/md";
import api from "../../api/axios";
import "./Teachers.css";

const TeacherProfile = () => {
  const { id } = useParams(); // Get teacher ID from the route
  const navigate = useNavigate();
  const [teacherDetails, setTeacherDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        const response = await api.get(`/admin/getProfile/${id}`);
        if (response.status === 200) {
          setTeacherDetails(response.data.data);
        } else {
          console.error("Failed to fetch teacher details");
        }
      } catch (error) {
        console.error("Error fetching teacher details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherDetails();
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

  if (!teacherDetails) {
    return <p>Teacher details not found</p>;
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    experience,
    document,
    image,
  } = teacherDetails;

  return (
    <div className="students">
      {/* Teacher Profile Header */}
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
                {getInitials(firstName + " " + lastName)}
              </div>
            )}
          </div>
          <div className="studentprofile3 text-white">
            <h6 className="text-white">{`${firstName} ${lastName}`}</h6>
            <h5 className="text-white">{email}</h5>
          </div>
        </div>
        <div className="studentprofile4">
          <FaArrowLeft size={30} onClick={() => navigate("/teachers")} />
        </div>
      </div>

      {/* Teacher Profile Details */}
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
        <div className="studentprofile6">
          <label>Years Of Experience</label>
          <input type="text" value={`${experience || 0} Years`} readOnly />
        </div>
        <div className="studentprofile6">
          <label>Document</label>
          {document ? (
            <a href={document} download className="teacherprofile">
              <MdFileDownload color="#000000" size={30} />
            </a>
          ) : (
            <p>No document available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default HOC(TeacherProfile);
