import { notification } from "antd";
import "antd/dist/reset.css";
import React, { useEffect, useState, memo, useCallback } from "react";
import { FaBook, FaClock, FaUniversity } from "react-icons/fa";
import { useDispatch } from "react-redux";
import api from "../../api/axios";
import {
  deleteLiveClass,
  fetchUpcomingClasses,
} from "../../redux/slices/liveClassSlice";
import CreateLiveClass from "./CreateLiveClass";

const LiveClassCard = memo(({ liveClass, liveLink }) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(liveClass.status);
  const [canDelete, setCanDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [canEditState, setCanEditState] = useState(true);

  const isClassLive = status === "lv" || status === "live";

  // Smart status-based auto-delete logic
  useEffect(() => {
    if (status === "completed" || status === "expired") {
      setCanDelete(true);
      return;
    }

    const pollClassStatus = async () => {
      try {
        const classId = liveClass.classId || liveClass._id;
        if (!classId) return;

        const now = new Date();
        const createdAt = new Date(liveClass.createdAt);
        const timeSinceCreation = now - createdAt;
        const protectionWindow = 2 * 60 * 1000;

        if (timeSinceCreation < protectionWindow) return;

        const response = await api.get(`/admin/live-classes/${classId}/status`);
        const statusData = response.data;
        const normalizedStatus = statusData.status === "live" ? "lv" : statusData.status;

        setStatus(normalizedStatus);
        setCanDelete(Boolean(statusData.canDelete));
        setCanEditState(statusData.canEdit !== false);
        if (statusData.message) setStatusMessage(statusData.message);
      } catch (error) {
        console.error("Error checking class status:", error);
      }
    };

    const now = new Date();
    const createdAt = new Date(liveClass.createdAt);
    const startTime = new Date(liveClass.startTime);
    const timeSinceCreation = now - createdAt;
    const timeSinceStart = now - startTime;
    const protectionWindow = 2 * 60 * 1000;

    const isClassStarted = timeSinceStart > 0;
    const pollingInterval = isClassLive ? 10000 : isClassStarted ? 20000 : 60000;

    let initialDelay = timeSinceCreation < protectionWindow ? protectionWindow - timeSinceCreation : 0;

    let statusInterval = null;
    const timeoutId = setTimeout(() => {
      pollClassStatus();
      statusInterval = setInterval(pollClassStatus, pollingInterval);
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (statusInterval) clearInterval(statusInterval);
    };
  }, [liveClass.classId, liveClass._id, liveClass.createdAt, liveClass.startTime, status, isClassLive]);

  const handleEdit = useCallback(() => {
    if (isClassLive) {
      notification.warning({
        message: "Cannot Edit Class",
        description: "This class is currently live.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }
    if (!canEditState) {
      notification.warning({
        message: "Cannot Edit Class",
        description: "This class cannot be edited at this time.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }
    setEditMode(true);
  }, [isClassLive, canEditState]);

  const handleDelete = useCallback(async () => {
    const deleteId = liveClass.classId || liveClass._id;

    if (!deleteId) {
      notification.error({ message: "Delete Failed", description: "Class ID is missing.", placement: "topRight", duration: 5 });
      return;
    }

    if (isClassLive) {
      notification.warning({ message: "Cannot Delete Class", description: "This class is currently live.", placement: "topRight", duration: 5 });
      return;
    }

    try {
      const statusResponse = await api.get(`/admin/live-classes/${deleteId}/status`);
      if (!statusResponse.data.canDelete) {
        notification.warning({ message: "Cannot Delete Class", description: statusResponse.data.message || "Class cannot be deleted.", placement: "topRight", duration: 5 });
        return;
      }

      if (window.confirm("Are you sure you want to delete this live class?")) {
        const response = await dispatch(deleteLiveClass(deleteId));
        if (response.meta.requestStatus === "fulfilled") {
          dispatch(fetchUpcomingClasses());
          notification.success({ message: "Class Deleted", description: `Class "${liveClass.title}" deleted.`, placement: "topRight", duration: 5 });
        } else {
          notification.error({ message: "Delete Failed", description: "Please try again.", placement: "topRight", duration: 5 });
        }
      }
    } catch (error) {
      console.error("Error deleting class:", error);
      if (!isClassLive && window.confirm("Could not verify class status. Delete anyway?")) {
        const response = await dispatch(deleteLiveClass(deleteId));
        if (response.meta.requestStatus === "fulfilled") {
          dispatch(fetchUpcomingClasses());
          notification.success({ message: "Class Deleted", description: `Class "${liveClass.title}" deleted.`, placement: "topRight", duration: 5 });
        }
      }
    }
  }, [liveClass, isClassLive, dispatch]);

  const handleGoLive = useCallback(() => {
    let liveUrl = liveClass.platform === "zoom" ? liveClass.zoomMeetingLink : liveLink;

    if (liveClass.platform === "merithub" && !liveUrl) {
      if (liveClass.instructorLink) {
        liveUrl = liveClass.instructorLink;
      } else if (liveClass.classId) {
        const CLIENT_ID = process.env.REACT_APP_MERIT_HUB_CLIENT_ID || '';
        liveUrl = `https://live.merithub.com/info/room/${CLIENT_ID}/${liveClass.classId}`;
      }
    }

    if (liveUrl) {
      window.open(liveUrl, '_blank');
      setStatus("lv");
    } else {
      notification.warning({
        message: "No Live Link",
        description: liveClass.platform === "merithub"
          ? "Link will be generated when the class starts."
          : "Live class link is not available.",
        placement: "topRight",
        duration: 3,
      });
    }
  }, [liveClass, liveLink]);

  if (editMode) {
    return <CreateLiveClass liveClass={liveClass} handleClose={() => setEditMode(false)} />;
  }

  const isEditable = !isClassLive && canEditState && canDelete;
  const isDeletable = !isClassLive && canDelete;

  const getStatusBadge = () => {
    if (isClassLive) return { text: "🔴 LIVE", color: "bg-red-500" };
    if (status === "completed") return { text: "✅ Completed", color: "bg-emerald-600" };
    if (status === "expired") return { text: "⌛ Ended", color: "bg-gray-600" };
    return { text: "📅 Scheduled", color: "bg-blue-500" };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="w-full bg-[#1c1c1c] p-3 sm:p-4 rounded-xl text-white border border-gray-700/50 relative transition-colors hover:border-blue-500/30">
      {/* Status Badge */}
      <div className={`absolute top-3 right-3 ${statusBadge.color} text-white text-xs font-bold px-2 py-0.5 rounded-full`}>
        {statusBadge.text}
      </div>

      {/* Header */}
      <div className="flex flex-wrap gap-2 items-center mb-2 pr-20">
        <h3 className="text-base font-bold flex items-center text-white">
          <FaBook className="mr-2 text-blue-400 text-sm" />
          {liveClass.title}
        </h3>
        <span className="text-[10px] bg-gray-700/60 px-2 py-0.5 rounded-full">
          {liveClass.platform === "zoom" ? "🎥 Zoom" : "📺 MeritHub"}
        </span>
      </div>

      {/* Class Details */}
      <div className="space-y-1 mb-3">
        <p className="flex items-center text-gray-300 text-xs">
          <FaClock className="mr-2 text-blue-400/80 text-xs" />
          <span className="text-gray-400 mr-1">Start:</span>
          {new Date(liveClass.startTime).toLocaleString("en-US", {
            weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
          })}
        </p>
        <p className="flex items-center text-gray-300 text-xs font-medium">
          <FaUniversity className="mr-2 text-purple-400/80 text-xs" />
          AKJ Classes
        </p>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <p className="text-[10px] text-gray-400 mb-2 bg-gray-800/50 px-2 py-1 rounded-lg">{statusMessage}</p>
      )}
      {canDelete && !isClassLive && (
        <p className="text-[10px] text-emerald-400 mb-2 flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded-lg">
          <span>✓</span> Session ended. Delete when ready.
        </p>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={handleGoLive}
          disabled={liveClass.platform === "zoom" && !liveClass.zoomMeetingLink}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${isClassLive
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
            } ${(liveClass.platform === "zoom" && !liveClass.zoomMeetingLink) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isClassLive ? "🔴 Live now" : "🚀 Go Live"}
        </button>
        <button
          onClick={handleEdit}
          disabled={!isEditable}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${isEditable ? "bg-amber-500 hover:bg-amber-600 text-gray-900" : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={!isDeletable}
          className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors ${isDeletable ? "bg-red-500 hover:bg-red-600 text-white" : "bg-gray-700 text-gray-500 cursor-not-allowed"
            }`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
});

LiveClassCard.displayName = 'LiveClassCard';

export default LiveClassCard;
