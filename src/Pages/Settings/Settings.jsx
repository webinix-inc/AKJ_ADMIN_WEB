import React, { useEffect, useState } from "react";
import axios from "axios";
import HOC from "../../Component/HOC/HOC";
import "./Settings.css";
import { LuImagePlus } from "react-icons/lu";
import api from "../../api/axios";

const Settings = () => {
  // State management for the profile data
  const [profile, setProfile] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    // bio: "",
    profilePicture: null,
    // logo: null,
  });
  const [originalProfile, setOriginalProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/getProfile");
        console.log("getProfile response is here :", res);
        const data = res.data?.data || {}; // adjust based on actual API structure
        setProfile({
          userId: data._id || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phone || "",
          //   bio: data.bio || "",
          profilePicture: data.image || null,
          //   logo: data.logo || null,
        });
        setOriginalProfile({
          userId: data._id || "",
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phone || "",
          profilePicture: data.image || null,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  // Handle input changes dynamically
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const { name } = e.target;
    const file = e.target.files[0];
    setProfile({ ...profile, [name]: file });
  };

  // Handle form reset
  // Handle form reset
  const handleReset = () => {
    if (originalProfile) {
      setProfile({ ...originalProfile });
    }
  };
  const handleUpdateProfile = async () => {
    try {
      const { firstName, lastName, email, phoneNumber } = profile;

      const payload = {
        firstName,
        lastName,
        email,
        phone: phoneNumber,
      };

      const response = await api.put("/admin/update-profile", payload);

      console.log("✅ Profile update response:", response.data);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("❌ Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };
  const handleUploadProfilePicture = async (userId) => {
    try {
      if (!userId) {
        alert("User ID is missing. Please refresh the page.");
        return;
      }

      // Check if the file is selected
      if (
        !profile.profilePicture ||
        !(profile.profilePicture instanceof File)
      ) {
        alert("Please select a valid image file.");
        return;
      }

      // Prepare FormData
      const formData = new FormData();
      formData.append("image", profile.profilePicture);

      // Send PUT request with userId as a dynamic parameter
      // Use raw axios to avoid global 'Content-Type: application/json' interference
      const token = localStorage.getItem("accessToken");
      const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:8890/api/v1";

      const response = await axios.put(
        `${apiBaseUrl}/admin/upload-profile-picture/${userId}`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            // Do NOT set Content-Type here; let the browser set it with the boundary
          },
        }
      );

      // Handle the response
      if (response.status === 200) {
        console.log("Profile picture updated successfully", response.data);
        alert("Profile picture updated successfully!");

        // Update local state with the new image URL from server
        const newImageUrl = response.data.data.image;
        setProfile(prev => ({
          ...prev,
          profilePicture: newImageUrl
        }));
        setOriginalProfile(prev => ({
          ...prev,
          profilePicture: newImageUrl
        }));

        // Optional: Reload to sync Navbar (since Navbar fetches its own data)
        window.location.reload();

      } else {
        console.error("Error updating profile picture:", response.data);
        alert("Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error during profile picture upload:", error);
      alert("Failed to upload profile picture. " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your personal information and profile picture</p>
      </div>

      <div className="settings-grid">
        {/* Profile Picture Section */}
        <div className="settings-card profile-section">
          <h2>Profile Picture</h2>
          <div className="profile-upload-container">
            {profile.profilePicture ? (
              <div className="profile-active-view">
                <div className="profile-image-wrapper">
                  <img
                    src={
                      typeof profile.profilePicture === "string"
                        ? profile.profilePicture
                        : URL.createObjectURL(profile.profilePicture)
                    }
                    alt="Profile"
                    className="profile-preview-img"
                  />
                </div>
                <div className="profile-actions">
                  <label className="upload-btn secondary">
                    Change Photo
                    <input
                      type="file"
                      name="profilePicture"
                      onChange={handleFileChange}
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </label>
                  {profile.profilePicture instanceof File && (
                    <button
                      className="action-btn primary"
                      onClick={() => handleUploadProfilePicture(profile.userId)}
                    >
                      Upload & Save
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label htmlFor="profilePicture" className="profile-upload-placeholder">
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  hidden
                />
                <div className="placeholder-content">
                  <LuImagePlus size={48} />
                  <span>Upload your photo</span>
                  <p>Supports: JPG, PNG, JPEG</p>
                </div>
              </label>
            )}
          </div>
        </div>

        {/* Personal Details Form */}
        <div className="settings-card form-section">
          <h2>Personal Information</h2>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Enter your first name"
                value={profile.firstName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Enter your last name"
                value={profile.lastName}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                value={profile.email}
                onChange={handleInputChange}
                className="form-input"
                disabled // Usually email shouldn't be changeable directly or just for safety
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={profile.phoneNumber}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions bottom">
            <button className="btn-reset" onClick={handleReset}>
              Reset Changes
            </button>
            <button className="btn-save" onClick={handleUpdateProfile}>
              Update Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HOC(Settings);
