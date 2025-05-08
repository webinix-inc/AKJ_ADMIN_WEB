import React, { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { fetchCourses } from "../../redux/slices/courseSlice";
import {
  scheduleLiveClass,
  editLiveClass,
  fetchUpcomingClasses,
} from "../../redux/slices/liveClassSlice";
import UpcomingLiveClasses from "./UpcomingLiveClasses";

const CreateLiveClass = ({ liveClass, handleClose }) => {
  const [isScheduled, setIsScheduled] = useState(!!liveClass);
  const [title, setTitle] = useState(liveClass?.title || "");
  const [courseIds, setCourseIds] = useState(
    liveClass?.courseIds.map((courseId) => ({ value: courseId, label: courseId })) || []
  );
  const [startDate, setStartDate] = useState(
    liveClass?.startTime ? new Date(liveClass.startTime).toISOString().split("T")[0] : ""
  );
  const [startTime, setStartTime] = useState(
    liveClass?.startTime ? new Date(liveClass.startTime).toTimeString().substr(0, 5) : ""
  );
  const [classCreated, setClassCreated] = useState(false);

  const dispatch = useDispatch();
  const { courses } = useSelector((state) => state.courses);
  const { loading } = useSelector((state) => state.liveClasses);

  const userId = "ct6r400mvcv78ejufqm0";

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const courseOptions = courses.map((course) => ({
    value: course._id,
    label: course.title,
  }));

  const handleCourseChange = (selectedOptions) => {
    setCourseIds(selectedOptions || []);
  };

  const handleSubmit = async (isImmediate = false) => {
    const courseIdsToSend = courseIds.map((option) => option.value);
    if (!title || courseIdsToSend.length === 0 || (!isImmediate && isScheduled && (!startDate || !startTime))) {
      alert("Please fill in all required fields.");
      return;
    }

    let formattedStartTime = null;
    if (isImmediate) {
      // "Go Live Now" logic
      formattedStartTime = new Date().toISOString();
    } else if (isScheduled && startDate && startTime) {
      // Scheduled class logic
      const dateTimeString = `${startDate}T${startTime}:00+00:00`;
      const istDate = new Date(dateTimeString);
      istDate.setHours(istDate.getHours() - 5);
      istDate.setMinutes(istDate.getMinutes() - 30);
      formattedStartTime = istDate.toISOString();
    }

    const liveClassData = {
      title,
      userId,
      courseIds: courseIdsToSend,
      startTime: formattedStartTime,
      ...(liveClass && { id: liveClass.id }),
    };

    try {
      if (liveClass) {
        const classId = liveClass?.classId;
        await dispatch(editLiveClass({ classId, updateDetails: liveClassData })).unwrap();
      } else {
        await dispatch(scheduleLiveClass(liveClassData)).unwrap();
        handleClose();
      }

      setClassCreated(true);
      dispatch(fetchUpcomingClasses());
    } catch (error) {
      alert("Failed to process the live class.");
      console.error(error);
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
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>
        )}
        <button
          onClick={() => handleSubmit(false)}
          disabled={loading}
          className={`w-full px-4 py-2 text-white rounded-md ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring focus:ring-blue-200`}
        >
          {loading ? "Processing..." : liveClass ? "Update Class" : "Schedule Class"}
        </button>

        {/* Go Live Now Button (Disabled when scheduled) */}
        {!liveClass && (
          <button
            onClick={() => handleSubmit(true)}
            disabled={loading || isScheduled} // Disable when scheduled
            className={`w-full px-4 py-2 mt-2 text-white rounded-md ${
              loading || isScheduled ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            } focus:outline-none focus:ring focus:ring-red-200`}
          >
            {loading ? "Processing..." : "Go Live Now"}
          </button>
        )}
      </div>
      {classCreated && <UpcomingLiveClasses />}
    </div>
  );
};

export default CreateLiveClass;
