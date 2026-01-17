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
  // Update courseIds with proper labels when courses are loaded and liveClass exists
  useEffect(() => {
    if (liveClass?.courseIds && courses.length > 0) {
      const mappedCourses = liveClass.courseIds
        .map((item) => {
          // Handle both raw ID (string) and populated object case
          const id = item._id || item;

          // Try to find full course details in the loaded courses list
          const course = courses.find((c) => c._id === id);

          if (course) {
            return { value: course._id, label: course.title };
          }

          // If not found in list (e.g. pagination) but we have populated data, use it
          if (item._id && item.title) {
            return { value: item._id, label: item.title };
          }

          return null;
        })
        .filter(Boolean);

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

  // React Select Custom Styles for Dark Mode
  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: "#262626", // Dark grey background
      borderColor: "#374151", // Gray-700
      color: "white",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#4B5563", // Gray-600
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "#262626",
      zIndex: 9999,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#374151" : "#262626",
      color: "white",
      "&:active": {
        backgroundColor: "#4B5563",
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: "#374151",
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: "white",
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: "#9CA3AF",
      ":hover": {
        backgroundColor: "#EF4444",
        color: "white",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "white",
    }),
  };

  return (
    <div className="bg-[#1c1c1c] rounded-lg shadow-lg p-6 w-full h-full flex flex-col border border-gray-800">
      <div className="flex text-white justify-between items-center mb-6">
        <h2 className="text-xl font-bold">{liveClass ? "Edit Live Class" : "Create Live Class"}</h2>
        <IoMdClose onClick={handleClose} size={24} className="cursor-pointer text-gray-400 hover:text-white transition-colors" />
      </div>
      <div className="space-y-5 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="space-y-1">
          <label className="text-gray-400 text-xs uppercase font-semibold pl-1">Class Title</label>
          <input
            type="text"
            placeholder="Enter class title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#262626] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white placeholder-gray-500 transition-colors"
          />
        </div>

        <div className="space-y-1">
          <label className="text-gray-400 text-xs uppercase font-semibold pl-1">Select Courses</label>
          <Select
            components={animatedComponents}
            isMulti
            value={courseIds}
            onChange={handleCourseChange}
            options={courseOptions}
            styles={customStyles}
            placeholder="Search and select courses..."
          />
        </div>

        {/* Platform Selection */}
        <div className="space-y-1">
          <label className="text-gray-400 text-xs uppercase font-semibold pl-1">Platform</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="w-full px-4 py-2.5 bg-[#262626] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white transition-colors appearance-none cursor-pointer"
          >
            <option value="merithub">📺 MeritHub</option>
            <option value="zoom">🎥 Zoom</option>
          </select>
        </div>

        {/* Zoom-specific fields */}
        {platform === "zoom" && (
          <div className="space-y-4 p-4 bg-[#262626] rounded-lg border border-gray-700">
            <h3 className="text-blue-400 text-sm font-semibold uppercase tracking-wide">Zoom Details</h3>

            <input
              type="url"
              placeholder="Zoom Meeting Link (Required)"
              value={zoomMeetingLink}
              onChange={(e) => setZoomMeetingLink(e.target.value)}
              className="w-full px-4 py-2 bg-[#1c1c1c] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm"
              required
            />

            <input
              type="text"
              placeholder="Meeting ID (Optional)"
              value={zoomMeetingId}
              onChange={(e) => setZoomMeetingId(e.target.value)}
              className="w-full px-4 py-2 bg-[#1c1c1c] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm"
            />

            <input
              type="text"
              placeholder="Passcode (Optional)"
              value={zoomPasscode}
              onChange={(e) => setZoomPasscode(e.target.value)}
              className="w-full px-4 py-2 bg-[#1c1c1c] border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm"
            />
          </div>
        )}

        <div className="flex items-center text-gray-300 bg-[#262626] p-3 rounded-lg border border-gray-800">
          <input
            type="checkbox"
            checked={isScheduled}
            onChange={() => setIsScheduled((prev) => !prev)}
            className="mr-3 w-4 h-4 rounded text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500 focus:ring-offset-gray-800 cursor-pointer"
            id="schedule-check"
          />
          <label htmlFor="schedule-check" className="cursor-pointer font-medium text-sm">Schedule for later</label>
        </div>

        {isScheduled && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-gray-400 text-xs uppercase font-semibold pl-1">Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (e.target.value < getTodayDate()) {
                    setStartDate(getTodayDate());
                  }
                }}
                min={getTodayDate()}
                className="w-full px-4 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm color-scheme-dark"
                style={{ colorScheme: 'dark' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-gray-400 text-xs uppercase font-semibold pl-1">Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => {
                  if (isToday) {
                    const selectedTime = e.target.value;
                    const currentTime = getCurrentTime();
                    if (selectedTime < currentTime) return;
                  }
                  setStartTime(e.target.value);
                }}
                min={getMinTime}
                className="w-full px-4 py-2 bg-[#262626] border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500 text-white text-sm"
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>
        )}

        <div className="space-y-3 pt-4">
          {isScheduled ? (
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading || !startDate || !startTime || !title || courseIds.length === 0}
              className={`w-full px-4 py-3 rounded-lg font-bold transition-all shadow-lg transform active:scale-95 ${loading || !startDate || !startTime || !title || courseIds.length === 0
                ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                liveClass ? "Update Class" : "Schedule Class"
              )}
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading || !title || courseIds.length === 0}
              className={`w-full px-4 py-3 rounded-lg font-bold transition-all shadow-lg transform active:scale-95 ${loading || !title || courseIds.length === 0
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                liveClass ? "Update & Go Live Only" : "🚀 Go Live Now"
              )}
            </button>
          )}
        </div>
      </div>
      {classCreated && <UpcomingLiveClasses />}
    </div>
  );
};

export default CreateLiveClass;
