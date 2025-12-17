import React, { useEffect, useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import api from "../../api/axios";
import { updateAdminMerithubId } from "../../redux/slices/adminSlice";
import { fetchCourses } from "../../redux/slices/courseSlice";
import {
  editLiveClass,
  fetchUpcomingClasses,
  scheduleLiveClass,
} from "../../redux/slices/liveClassSlice";
import UpcomingLiveClasses from "./UpcomingLiveClasses";

const CreateLiveClass = ({ liveClass, handleClose }) => {
  const [isScheduled, setIsScheduled] = useState(!!liveClass);
  const [title, setTitle] = useState(liveClass?.title || "");
  const [courseIds, setCourseIds] = useState([]);
  const [startDate, setStartDate] = useState(
    liveClass?.startTime ? new Date(liveClass.startTime).toISOString().split("T")[0] : ""
  );
  const [startTime, setStartTime] = useState(
    liveClass?.startTime ? new Date(liveClass.startTime).toTimeString().substr(0, 5) : ""
  );
  const [classCreated, setClassCreated] = useState(false);
  
  // Platform and Zoom-specific states
  const [platform, setPlatform] = useState(liveClass?.platform || "merithub");
  const [zoomMeetingLink, setZoomMeetingLink] = useState(liveClass?.zoomMeetingLink || "");
  const [zoomMeetingId, setZoomMeetingId] = useState(liveClass?.zoomMeetingId || "");
  const [zoomPasscode, setZoomPasscode] = useState(liveClass?.zoomPasscode || "");

  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);
  const { loading } = useSelector((state) => state.liveClasses);

  // Get user data from Redux state
  const adminData = useSelector((state) => state.admin?.adminData?.data);
  const merithubUserId = adminData?.merithubUserId;

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  // Update courseIds with proper labels when courses are loaded and liveClass exists
  useEffect(() => {
    if (liveClass?.courseIds && courses.length > 0) {
      const mappedCourses = liveClass.courseIds
        .map((courseId) => {
          const course = courses.find((c) => c._id === courseId);
          return course ? { value: course._id, label: course.title } : null;
        })
        .filter(Boolean); // Remove any null values if course not found
      setCourseIds(mappedCourses);
    }
  }, [courses, liveClass]);

  const courseOptions = courses.map((course) => ({
    value: course._id,
    label: course.title,
  }));

  const handleCourseChange = (selectedOptions) => {
    setCourseIds(selectedOptions || []);
  };

  // Get today's date and current time for validation
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD format
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`; // HH:MM format
  };

  // Check if selected date is today (recalculated when startDate changes)
  const isToday = useMemo(() => {
    if (!startDate) return false;
    return startDate === getTodayDate();
  }, [startDate]);

  // Get minimum time: if today is selected, use current time, otherwise allow any time
  const getMinTime = useMemo(() => {
    if (isToday) {
      return getCurrentTime();
    }
    return "00:00"; // Allow any time for future dates
  }, [isToday]);

  // Function to register admin in MeritHub
  const registerAdminInMeritHubIfNeeded = async () => {
    if (!adminData || !adminData.userId || !adminData.email) {
      throw new Error("Admin data is incomplete. Please log in again.");
    }

    const name = `${adminData.firstName || ""} ${adminData.lastName || ""}`.trim() || adminData.email;
    
    try {
      const response = await api.post("/admin/register-merithub", {
        adminId: adminData.userId,
        name: name,
        email: adminData.email,
      });

      if (response.data && response.data.merithubUserId) {
        // Update Redux state with new merithubUserId
        dispatch(updateAdminMerithubId(response.data.merithubUserId));
        return response.data.merithubUserId;
      } else {
        throw new Error("Failed to get MeritHub user ID from response");
      }
    } catch (error) {
      console.error("Error registering admin in MeritHub:", error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || "Failed to register in MeritHub";
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (isImmediate = false) => {
    const courseIdsToSend = courseIds.map((option) => option.value);
    // Platform-specific validation
    if (!title || courseIdsToSend.length === 0) {
      alert("Please fill in title and select courses.");
      return;
    }
    
    if (platform === "zoom" && !zoomMeetingLink.trim()) {
      alert("Please provide a Zoom meeting link.");
      return;
    }
    
    if (!isImmediate && isScheduled && (!startDate || !startTime)) {
      alert("Please fill in all required fields.");
      return;
    }

    // Validate that scheduled date/time is not in the past
    if (!isImmediate && isScheduled && startDate && startTime) {
      const today = getTodayDate();
      const selectedDate = startDate;
      
      // Check if date is in the past
      if (selectedDate < today) {
        alert("Cannot schedule a class for a past date. Please select today or a future date.");
        return;
      }
      
      // If today is selected, check if time is in the past
      if (selectedDate === today) {
        const currentTime = getCurrentTime();
        if (startTime < currentTime) {
          alert("Cannot schedule a class for a past time. Please select a future time.");
          return;
        }
      }
    }

    let formattedStartTime = null;
    if (isImmediate) {
      // "Go Live Now" logic - works for both Zoom and MeritHub
      formattedStartTime = new Date().toISOString();
    } else if (isScheduled && startDate && startTime) {
      // Proper timezone handling for IST
      // Treat the input as IST and convert to UTC explicitly
      const dateTimeString = `${startDate}T${startTime}:00+05:30`; // Explicitly specify IST timezone
      const istDate = new Date(dateTimeString);
      formattedStartTime = istDate.toISOString(); // This will be in UTC
    } else if (!isScheduled) {
      // For non-scheduled classes (immediate), set current time
      formattedStartTime = new Date().toISOString();
    }

    // Handle MeritHub registration if needed
    let currentMerithubUserId = merithubUserId;
    if (platform === "merithub" && !currentMerithubUserId) {
      try {
        // Show loading message
        const registerConfirm = window.confirm(
          "You need to be registered in MeritHub to create live classes. Would you like to register now? (This will only take a moment)"
        );
        
        if (!registerConfirm) {
          return; // User cancelled registration
        }

        // Register admin in MeritHub
        currentMerithubUserId = await registerAdminInMeritHubIfNeeded();
        alert("Successfully registered in MeritHub! You can now create live classes.");
      } catch (error) {
        alert(`Failed to register in MeritHub: ${error.message}`);
        return;
      }
    }

    const liveClassData = {
      title,
      userId: platform === "merithub" ? currentMerithubUserId : undefined, // Use MeritHub user ID for instructor
      courseIds: courseIdsToSend,
      startTime: formattedStartTime,
      platform,
      ...(platform === "zoom" && {
        zoomMeetingLink,
        zoomMeetingId,
        zoomPasscode,
      }),
      ...(liveClass && { id: liveClass.id }),
    };

    try {
      if (liveClass) {
        const classId = liveClass?.classId || liveClass?._id;
        if (!classId) {
          alert("Error: Class ID is missing. Cannot update class.");
          return;
        }
        await dispatch(editLiveClass({ classId, updateDetails: liveClassData })).unwrap();
        alert("Live class updated successfully!");
      } else {
        await dispatch(scheduleLiveClass(liveClassData)).unwrap();
        alert("Live class created successfully!");
        handleClose();
      }

      setClassCreated(true);
      dispatch(fetchUpcomingClasses());
    } catch (error) {
      const errorMessage = error?.message || error?.error || "Failed to process the live class.";
      alert(`Error: ${errorMessage}`);
      console.error("Live class operation error:", error);
    }
  };

  const animatedComponents = makeAnimated();

  return (
    <div className="bg-[#141414] rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="flex text-white justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{liveClass ? "Edit Live Class" : "Create Live Class"}</h2>
        <IoMdClose onClick={handleClose} size={24} className="cursor-pointer" />
      </div>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Class Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
        />
        <Select
          components={animatedComponents}
          isMulti
          value={courseIds}
          onChange={handleCourseChange}
          options={courseOptions}
          className="text-black"
          placeholder="Select Courses"
        />
        
        {/* Platform Selection */}
        <div className="space-y-2">
          <label className="text-white font-medium">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200 text-black"
          >
            <option value="merithub">📺 MeritHub</option>
            <option value="zoom">🎥 Zoom</option>
          </select>
        </div>

        {/* Zoom-specific fields */}
        {platform === "zoom" && (
          <div className="space-y-4 p-4 bg-gray-800 rounded-md">
            <h3 className="text-white font-medium">Zoom Meeting Details</h3>
            
            <input
              type="url"
              placeholder="Zoom Meeting Link (Required)"
              value={zoomMeetingLink}
              onChange={(e) => setZoomMeetingLink(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
              required
            />
            
            <input
              type="text"
              placeholder="Meeting ID (Optional)"
              value={zoomMeetingId}
              onChange={(e) => setZoomMeetingId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            
            <input
              type="text"
              placeholder="Passcode (Optional)"
              value={zoomPasscode}
              onChange={(e) => setZoomPasscode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        )}
        
        <div className="flex items-center text-white">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={() => setIsScheduled((prev) => !prev)}
            className="mr-2"
          />
          <label>Schedule for later</label>
        </div>
        {isScheduled && (
          <div className="space-y-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                // If user selects a past date, reset to today
                if (e.target.value < getTodayDate()) {
                  setStartDate(getTodayDate());
                }
                // If user changes from today to future date, reset time min constraint
                if (e.target.value > getTodayDate() && isToday) {
                  // Time can be any value for future dates
                }
              }}
              min={getTodayDate()}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => {
                // If today is selected, validate time is not in the past
                if (isToday) {
                  const selectedTime = e.target.value;
                  const currentTime = getCurrentTime();
                  if (selectedTime < currentTime) {
                    // Don't update if time is in the past
                    return;
                  }
                }
                setStartTime(e.target.value);
              }}
              min={getMinTime}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        )}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className={`w-full px-4 py-3 text-white rounded-md font-medium transition-all ${
              loading ? "bg-gray-600 cursor-not-allowed" : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            }`}
          >
            {loading ? "Processing..." : liveClass ? "Update Class" : "Schedule Class"}
          </button>

          {/* Go Live Now Button (Disabled when scheduled) */}
          {!liveClass && (
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading || isScheduled}
              className={`w-full px-4 py-3 text-white rounded-md font-medium transition-all ${
                loading || isScheduled
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              }`}
            >
              {loading ? "Processing..." : "🚀 Go Live Now"}
            </button>
          )}
        </div>
      </div>
      {classCreated && <UpcomingLiveClasses />}
    </div>
  );
};

export default CreateLiveClass;
