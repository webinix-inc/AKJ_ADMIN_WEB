import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import { useNavigate } from "react-router-dom";
import "./Teachers.css";
import { LuImagePlus } from "react-icons/lu";
import { FaArrowLeft } from "react-icons/fa6";
import { useDispatch, useSelector } from "react-redux";
import { registerTeacher } from "../../redux/slices/teacherSlice";

const AddTeacher = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.teacher);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    experience: "",
    userBio: "",
    courses: [],
    photo: null,
    document: null,
    permissions: {
      coursesPermission: true,
      bookStorePermission: true,
      planPermission: true,
      reportAndAnalyticPermission: true,
      chatPermission: true,
      marketingServicesPermission: true,
      testPortalPermission: true,
      peoplePermission: true,
    },
  });

  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Fetch available courses (replace with your API endpoint)
    const fetchCourses = async () => {
      const mockCourses = [
        { id: 1, name: "Course 1" },
        { id: 2, name: "Course 2" },
        { id: 3, name: "Course 3" },
      ];
      setCourses(mockCourses);
    };
    fetchCourses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else if (type === "checkbox") {
      if (name.startsWith("permissions.")) {
        const permissionKey = name.split(".")[1];
        setFormData({
          ...formData,
          permissions: {
            ...formData.permissions,
            [permissionKey]: checked,
          },
        });
      } else {
        setFormData({ ...formData, [name]: checked });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCourseChange = (e) => {
    const { options } = e.target;
    const selectedCourses = Array.from(options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    setFormData({ ...formData, courses: selectedCourses });
  };

  const handleSubmit = async () => {
    try {
      const formDataToSend = new FormData();
  
      // Append each field from formData to formDataToSend
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
  
        // Handle arrays (e.g., courses)
        if (key === "courses" && Array.isArray(value)) {
          value.forEach((course) => formDataToSend.append(key, course));
        }
        // Handle files (e.g., photo, document)
        else if (key === "photo" || key === "document") {
          if (value) {
            formDataToSend.append(key, value);
          }
        }
        // Handle permissions as JSON string
        else if (key === "permissions") {
          formDataToSend.append(key, JSON.stringify(value));
        }
        // Handle other fields
        else if (value !== null && value !== undefined) {
          formDataToSend.append(key, value);
        }
      });
  
      // Debug: Log FormData contents (optional)
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
  
      // Dispatch the action
      await dispatch(
        registerTeacher({ teacherData: formDataToSend }) // Adjust token management if required
      );
      

      // Handle success
      console.log("Teacher registered successfully!");
      // Show success message to the user
      alert("Teacher registered successfully!");
      navigate("/teachers")
  
    } catch (error) {
      console.error("Error during form submission:", error);
  
      // Handle different error scenarios
      if (error.response) {
        // Server responded with a status other than 200-299
        console.error("Server Error:", error.response.data);
        alert(`Submission failed: ${error.response.data.message || "Server error"}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error("Network Error:", error.request);
        alert("Submission failed: Network error, please try again.");
      } else {
        // Something else caused the error
        console.error("Unexpected Error:", error.message);
        alert(`Submission failed: ${error.message}`);
      }
    }
  };
  

  return (
    <div className="coursesEdit">
      <div className="coursesEdit1">
        <FaArrowLeft
          color="#FFFFFF"
          size={20}
          onClick={() => navigate("/teachers")}
        />
        <h6>Add A User</h6>
      </div>

      <div>
        <div className="setting2">
          <div className="setting3 flex">
            <div className="flex flex-col gap-2">
              <label htmlFor="photo">Teacher’s Photo</label>
              <div className="setting4">
                <div className="setting5">
                  {formData.photo ? (
                    <p>{formData.photo.name}</p>
                  ) : (
                    <>
                      <LuImagePlus color="#8D98AA" size={30} />
                      <p>Upload Teacher’s Photo</p>
                    </>
                  )}
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleChange}
                    style={{ display: "none" }}
                    id="photo"
                  />
                </div>
              </div>
            </div>
            {/* Permissions Section */}
            <div className="permissions flex ml-6">
              <div className="flex flex-col gap-4">
                <h6 className="text-white">Permissions</h6>
                <div className="flex text-white gap-4 flex-wrap">
                  {Object.keys(formData.permissions).map((permission) => (
                    <div
                      className="permission-toggle flex gap-2"
                      key={permission}
                    >
                      <label className="text-white">
                        {permission.replace(/Permission$/, "")}
                      </label>
                      <label className="switch">
                        <input
                          type="checkbox"
                          name={`permissions.${permission}`}
                          checked={formData.permissions[permission]}
                          onChange={handleChange}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="addteacher3">
          <div className="addteacher4">
            <div className="addteacher2">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="mobileNumber">Phone</label>
              <input
                type="text"
                name="mobileNumber"
                placeholder="Enter phone number"
                value={formData.mobileNumber}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="experience">Years of Experience</label>
              <input
                type="number"
                name="experience"
                placeholder="Enter years of experience"
                value={formData.experience}
                onChange={handleChange}
              />
            </div>
            <div className="addteacher2">
              <label htmlFor="userBio">Bio</label>
              <textarea
                name="userBio"
                placeholder="Write a brief bio"
                value={formData.userBio}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <div className="addteacher6">
            <button onClick={handleSubmit} disabled={loading}>
              {loading ? "Adding..." : "Add"}
            </button>
            <div>
              {error && (
                <p className="error">
                  {typeof error === "string"
                    ? error
                    : error.message || "An error occurred"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HOC(AddTeacher);
