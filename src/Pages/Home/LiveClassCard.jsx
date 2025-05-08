import React, { useState, useEffect } from "react";
import { FaClock, FaBook, FaUniversity } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { notification } from "antd";
import "antd/dist/reset.css";
import CreateLiveClass from "./CreateLiveClass";
import {
  deleteLiveClass,
  fetchUpcomingClasses,
} from "../../redux/slices/liveClassSlice";
import Modal from "./Modal";

const LiveClassCard = ({ liveClass, liveLink }) => {
  const dispatch = useDispatch();
  const [isLive, setIsLive] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [status, setStatus] = useState(liveClass.status); // ✅ Track status separately

  useEffect(() => {
    const checkIsLive = () => {
      const now = new Date();
      const startTime = new Date(liveClass.startTime);
      setIsLive(now >= startTime);
    };

    checkIsLive();
    const interval = setInterval(checkIsLive, 1000);
    return () => clearInterval(interval);
  }, [liveClass.startTime]);

  // ✅ Auto-delete logic with Ant Design Notification
  useEffect(() => {
    const creationTime = new Date(liveClass.startTime);
    const deleteTimeout = setTimeout(async () => {
      const now = new Date();
      const tenMinutesPassed = now - creationTime >= 120000;

      if (tenMinutesPassed && status !== "lv") {
        console.log(
          `Deleting class ${liveClass.classId} as it didn't go live in 10 min`
        );
        const response = await dispatch(deleteLiveClass(liveClass.classId));

        if (response.meta.requestStatus === "fulfilled") {
          dispatch(fetchUpcomingClasses());

          // ✅ Show Ant Design notification when class is auto-deleted
          notification.info({
            message: "Class Auto-Deleted",
            description: `Class "${liveClass.title}" was automatically deleted as it didn't go live within 10 minutes.`,
            placement: "topRight",
            duration: 5,
          });
        }
      }
    }, 120000);

    return () => clearTimeout(deleteTimeout);
  }, [liveClass.startTime, status, liveClass.classId, dispatch]);

  const handleEdit = () => setEditMode(true);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this live class?")) {
      const response = await dispatch(deleteLiveClass(liveClass.classId));
      if (response.meta.requestStatus === "fulfilled") {
        dispatch(fetchUpcomingClasses());

        // ✅ Show Ant Design notification when class is manually deleted
        notification.success({
          message: "Class Deleted",
          description: `Class "${liveClass.title}" has been successfully deleted.`,
          placement: "topRight",
          duration: 5,
        });
      }
    }
  };

  if (editMode) {
    return (
      <CreateLiveClass
        liveClass={liveClass}
        handleClose={() => setEditMode(false)}
      />
    );
  }

  const isEditable = status !== "lv";
  const isDeletable = status !== "lv";

  return (
    <div className="w-full bg-[#f8faff] p-6 rounded-lg shadow-lg text-gray-800 max-w-md mx-auto relative">
      <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
        Live Class
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <h3 className="text-lg font-semibold flex items-center">
          <FaBook className="mr-2 text-blue-500" /> {liveClass.title}
        </h3>
      </div>
      <p className="flex items-center text-gray-600 text-sm mb-2">
        <FaClock className="mr-2 text-gray-500" />
        {new Date(liveClass.startTime).toLocaleString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="flex items-center text-gray-800 text-sm font-semibold">
        <FaUniversity className="mr-2 text-blue-500" />
        AKJ Academy
      </p>
      <div className="flex text-sm items-center justify-center whitespace-nowrap">
        <button
          onClick={() => setShowModal(true)}
          disabled={!isLive}
          className={`mt-4 px-4 py-2 rounded-lg font-semibold ${
            isLive
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Go Live
        </button>
        <button
          onClick={handleEdit}
          disabled={!isEditable}
          className={`mt-4 ml-4 px-4 py-2 rounded-lg font-semibold ${
            isEditable
              ? "bg-yellow-400 hover:bg-yellow-500 text-black"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={!isDeletable}
          className={`mt-4 ml-4 px-4 py-2 rounded-lg font-semibold ${
            isDeletable
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Delete
        </button>
      </div>

      {/* Modal for the iframe */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <div className="p-10 relative w-full h-full">
            <iframe
              src={liveLink}
              title="Live Class"
              className="w-full h-full border-none"
            ></iframe>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LiveClassCard;
