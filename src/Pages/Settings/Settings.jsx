import React, { useEffect, useState } from "react";
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
  const handleReset = () => {
    setProfile({
      firstName: "",
      lastName: "",
      email: "",
      userType: "",
      phoneNumber: "",
      //   bio: "",
      profilePicture: null,
      //   logo: null,
    });
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
      const response = await api.put(
        `/admin/upload-profile-picture/${userId}`, // Insert userId dynamically here
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle the response
      if (response.status === 200) {
        console.log("Profile picture updated successfully", response.data);
        alert("Profile picture updated successfully!");
      } else {
        console.error("Error updating profile picture:", response.data);
        alert("Failed to update profile picture.");
      }
    } catch (error) {
      console.error("Error during profile picture upload:", error);
      alert("Failed to upload profile picture.");
    }
  };

  return (
    <>
      <div className="setting">
        <div className="setting1">
          <p>Account Setting</p>
        </div>
        <div className="setting2">
          <div className="setting3">
            <label htmlFor="profilePicture">Your Profile Picture</label>

            {profile.profilePicture ? (
              <div className="mt-6 flex items-center gap-4">
                <img
                  src={profile.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border shadow"
                />

                <input
                  type="file"
                  name="profilePicture"
                  onChange={handleFileChange} // Trigger the file selection handler
                  accept="image/*"
                  //   style={{ display: "none" }}
                />
                <div
                  className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                  onClick={() => handleUploadProfilePicture(profile.userId)}
                >
                  Update Profile Picture
                </div>
              </div>
            ) : (
              <div className="setting4">
                <div className="setting5">
                  <input
                    type="file"
                    id="profilePicture"
                    name="profilePicture"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label htmlFor="profilePicture" className="file-label">
                    <LuImagePlus color="#8D98AA" size={30} />
                    <p>Upload your photo</p>
                  </label>
                </div>
              </div>
            )}
          </div>
          {/* <div className="setting3">
            <label htmlFor="logo">Your LOGO</label>
            <div className="setting4">
              <div className="setting5">
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                />
                <label htmlFor="logo" className="file-label">
                  <LuImagePlus color="#8D98AA" size={30} />
                  <p>Upload LOGO</p>
                </label>
              </div>
            </div>
          </div> */}
        </div>

        <div className="setting6">
          <div className="setting7">
            <div className="setting8">
              <label htmlFor="fullName">First name</label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Please enter your first name"
                value={profile.firstName}
                onChange={handleInputChange}
              />
            </div>
            <div className="setting8">
              <label htmlFor="fullName">Last name</label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Please enter your full name"
                value={profile.lastName}
                onChange={handleInputChange}
              />
            </div>
            <div className="setting8">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Please enter your email"
                value={profile.email}
                onChange={handleInputChange}
              />
            </div>
            {/* <div className="setting8">
              <label htmlFor="userType">UserType</label>
              <input
                type="text"
                name="userType"
                id="userType"
                placeholder="Please enter your userType"
                value={profile.userType}
                onChange={handleInputChange}
              />
            </div> */}
            <div className="setting8">
              <label htmlFor="phoneNumber">Phone number</label>
              <input
                type="text"
                name="phoneNumber"
                id="phoneNumber"
                placeholder="Please enter your phone number"
                value={profile.phoneNumber}
                onChange={handleInputChange}
              />
            </div>
          </div>
          {/* <div className="setting9">
            <div className="setting8">
              <label htmlFor="bio">Bio</label>
              <textarea
                name="bio"
                id="bio"
                placeholder="Write your Bio here e.g your hobbies, interests ETC"
                value={profile.bio}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div> */}
          <div className="setting10">
            <button onClick={handleUpdateProfile}>Update Details</button>

            <p onClick={handleReset} style={{ cursor: "pointer" }}>
              Reset
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default HOC(Settings);
