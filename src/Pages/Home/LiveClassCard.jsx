import { notification } from "antd";
import "antd/dist/reset.css";
import React, { useEffect, useState } from "react";
import { FaBook, FaClock, FaUniversity } from "react-icons/fa";
import { useDispatch } from "react-redux";
import api from "../../api/axios";
import {
  deleteLiveClass,
  fetchUpcomingClasses,
} from "../../redux/slices/liveClassSlice";
import CreateLiveClass from "./CreateLiveClass";

const LiveClassCard = ({ liveClass, liveLink }) => {
  const dispatch = useDispatch();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState(liveClass.status); // ✅ Track status separately
  const [canDelete, setCanDelete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // ✅ Smart status-based auto-delete logic
  useEffect(() => {
    if (status === "completed" || status === "expired") {
      setCanDelete(true);
      return;
    }

    const pollClassStatus = async () => {
      try {
        const classId = liveClass.classId || liveClass._id;

        if (!classId) {
          console.warn("⚠️ [STATUS CHECK] No class ID available");
          return;
        }

        const now = new Date();
        const createdAt = new Date(liveClass.createdAt);
        const timeSinceCreation = now - createdAt;
        const protectionWindow = 2 * 60 * 1000; // 2 minutes

        if (timeSinceCreation < protectionWindow) {
          return;
        }

        const response = await api.get(`/admin/live-classes/${classId}/status`);
        const statusData = response.data;
        const normalizedStatus =
          statusData.status === "live" ? "lv" : statusData.status;

        setStatus(normalizedStatus);
        setCanDelete(Boolean(statusData.canDelete));
        if (statusData.message) {
          setStatusMessage(statusData.message);
        }
      } catch (error) {
        console.error("❌ [STATUS CHECK] Error checking class status:", error);
      }
    };

    const now = new Date();
    const createdAt = new Date(liveClass.createdAt);
    const startTime = new Date(liveClass.startTime);
    const timeSinceCreation = now - createdAt;
    const timeSinceStart = now - startTime;
    const protectionWindow = 2 * 60 * 1000;

    const isClassStarted = timeSinceStart > 0;
    const isLive = status === "lv" || status === "live";
    const pollingInterval = isLive
      ? 10000
      : isClassStarted
      ? 20000
      : 60000;

    let initialDelay = 0;
    if (timeSinceCreation < protectionWindow) {
      initialDelay = protectionWindow - timeSinceCreation;
    }

    let statusInterval = null;
    const timeoutId = setTimeout(() => {
      pollClassStatus();
      statusInterval = setInterval(pollClassStatus, pollingInterval);
    }, initialDelay);

    return () => {
      clearTimeout(timeoutId);
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [
    liveClass.classId,
    liveClass._id,
    liveClass.createdAt,
    liveClass.startTime,
    status,
    liveClass.duration,
  ]);

  const isClassLive = status === "lv" || status === "live";
  const [canEditState, setCanEditState] = useState(true); // Track edit permission from backend

  // Update canEdit based on status check
  useEffect(() => {
    const checkEditPermission = async () => {
      try {
        const classId = liveClass.classId || liveClass._id;
        if (!classId) return;
        
        const response = await api.get(`/admin/live-classes/${classId}/status`);
        const statusData = response.data;
        setCanEditState(statusData.canEdit !== false); // Default to true if not specified
      } catch (error) {
        console.error("Error checking edit permission:", error);
        // Default to allowing edit if check fails (for scheduled classes)
        setCanEditState(!isClassLive);
      }
    };
    
    checkEditPermission();
  }, [liveClass.classId, liveClass._id, isClassLive]);

  const handleEdit = () => {
    if (isClassLive) {
      notification.warning({
        message: "Cannot Edit Class",
        description: "This class is currently live. Editing is not allowed during a live session.",
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
  };

  const handleDelete = async () => {
    const deleteId = liveClass.classId || liveClass._id;
    
    if (!deleteId) {
      notification.error({
        message: "Delete Failed",
        description: "Class ID is missing. Cannot delete.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }
    
    // Check if class has started or is live before making API call
    if (isClassLive) {
      notification.warning({
        message: "Cannot Delete Class",
        description: "This class is currently live. Deletion is not allowed during a live session.",
        placement: "topRight",
        duration: 5,
      });
      return;
    }
    
    try {
      // Check class status before allowing deletion using axios instance
      const statusResponse = await api.get(`/admin/live-classes/${deleteId}/status`);
      const statusData = statusResponse.data;
      
      if (!statusData.canDelete) {
        notification.warning({
          message: "Cannot Delete Class",
          description: statusData.message || "Class is currently live and cannot be deleted.",
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      
      if (window.confirm("Are you sure you want to delete this live class?")) {
        console.log('🗑️ [MANUAL DELETE] Deleting class with ID:', deleteId);
        
        const response = await dispatch(deleteLiveClass(deleteId));
        if (response.meta.requestStatus === "fulfilled") {
          dispatch(fetchUpcomingClasses());

          // ✅ Show Ant Design notification when class is manually deleted
          notification.success({
            message: "Class Deleted",
            description: `Class "${liveClass.title}" has been successfully deleted.`,
            placement: "topRight",
            duration: 5,
          });
        } else {
          // Show error notification if delete failed
          notification.error({
            message: "Delete Failed",
            description: `Failed to delete class "${liveClass.title}". Please try again.`,
            placement: "topRight",
            duration: 5,
          });
        }
      }
    } catch (error) {
      console.error("❌ [DELETE CHECK] Error checking class status:", error);
      
      // If status check fails, check if class has started before allowing deletion
      // This handles cases where the API might be temporarily unavailable
      if (isClassLive) {
        notification.error({
          message: "Cannot Delete Class",
          description: "This class is currently live. Deletion is not allowed during a live session.",
          placement: "topRight",
          duration: 5,
        });
        return;
      }
      
      // Only allow deletion if class hasn't started and status check failed
      if (window.confirm("Could not verify class status. Delete anyway?")) {
        console.log('🗑️ [MANUAL DELETE] Deleting class with ID (status check failed):', deleteId);
        
        const response = await dispatch(deleteLiveClass(deleteId));
        if (response.meta.requestStatus === "fulfilled") {
          dispatch(fetchUpcomingClasses());
          notification.success({
            message: "Class Deleted",
            description: `Class "${liveClass.title}" has been successfully deleted.`,
            placement: "topRight",
            duration: 5,
          });
        } else {
          notification.error({
            message: "Delete Failed",
            description: `Failed to delete class "${liveClass.title}". Please try again.`,
            placement: "topRight",
            duration: 5,
          });
        }
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

  // Disable edit/delete based on status and backend permissions
  const isEditable = !isClassLive && canEditState && canDelete; // Can edit if not live, backend allows edit, and can delete
  const isDeletable = !isClassLive && canDelete; // Can delete if not live and backend allows

  // Determine status badge (completed classes are deleted, so we don't need to handle them)
  const getStatusBadge = () => {
    if (isClassLive) {
      return { text: "🔴 LIVE", bg: "bg-gradient-to-r from-red-500 to-red-600" };
    }
    if (status === "completed") {
      return { text: "✅ Completed", bg: "bg-gradient-to-r from-emerald-500 to-green-600" };
    }
    if (status === "expired") {
      return { text: "⌛ Ended", bg: "bg-gradient-to-r from-gray-500 to-gray-600" };
    }
    return { text: "📅 Scheduled", bg: "bg-gradient-to-r from-blue-500 to-blue-600" };
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="w-full bg-[#1c1c1c] p-4 rounded-lg shadow-lg text-white border border-gray-700 relative">
      <div className={`absolute top-2 right-2 ${statusBadge.bg} text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm`}>
        {statusBadge.text}
      </div>
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <h3 className="text-lg font-semibold flex items-center text-white">
          <FaBook className="mr-2 text-blue-400" /> {liveClass.title}
        </h3>
        <span className="text-xs bg-gray-700 px-2 py-1 rounded-full">
          {liveClass.platform === "zoom" ? "🎥 Zoom" : "📺 MeritHub"}
        </span>
      </div>
      <p className="flex items-center text-gray-300 text-sm mb-2">
        <FaClock className="mr-2 text-gray-400" />
        Start: {new Date(liveClass.startTime).toLocaleString("en-US", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </p>
      <p className="flex items-center text-gray-300 text-sm font-medium mb-4">
        <FaUniversity className="mr-2 text-blue-400" />
        AKJ Classes
      </p>
      {statusMessage && (
        <p className="text-xs text-gray-400 mb-1">{statusMessage}</p>
      )}
      {canDelete && !isClassLive && (
        <p className="text-xs text-emerald-400 mb-3">
          MeritHub marked this session as ended. Delete it whenever you’re ready.
        </p>
      )}
      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => {
            // For MeritHub classes, construct link from classId if liveLink is not available
            let liveUrl = liveClass.platform === "zoom" ? liveClass.zoomMeetingLink : liveLink;
            
            // If MeritHub class and no liveLink, try to construct from classId or use instructorLink
            if (liveClass.platform === "merithub" && !liveUrl) {
              if (liveClass.instructorLink) {
                liveUrl = liveClass.instructorLink;
              } else if (liveClass.classId) {
                // Construct MeritHub link from classId (fallback)
                const CLIENT_ID = process.env.REACT_APP_MERIT_HUB_CLIENT_ID || '';
                liveUrl = `https://live.merithub.com/info/room/${CLIENT_ID}/${liveClass.classId}`;
              }
            }
            
            if (liveUrl) {
              window.open(liveUrl, '_blank');
              // Optimistically mark class as live so controls lock immediately
              setStatus("lv");
            } else {
              notification.warning({
                message: "No Live Link",
                description: liveClass.platform === "merithub" 
                  ? "Live class link is not available yet. The link will be generated when the class starts."
                  : "Live class link is not available.",
                placement: "topRight",
                duration: 3,
              });
            }
          }}
          disabled={
            // For Zoom: require zoomMeetingLink
            // For MeritHub: enable if class exists (even without link, we'll try to get it when clicked)
            liveClass.platform === "zoom" 
              ? !liveClass.zoomMeetingLink 
              : false // Always enable for MeritHub - we'll handle link generation on click
          }
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            isClassLive
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-md"
          } ${(liveClass.platform === "zoom" ? !liveClass.zoomMeetingLink : false) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isClassLive ? "🔴 Class is live now" : "🚀 Go Live"}
        </button>
        <button
          onClick={handleEdit}
          disabled={!isEditable}
          title={!isEditable ? "Cannot edit live class" : "Edit class details"}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            isEditable
              ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-black hover:from-yellow-600 hover:to-yellow-700 shadow-md"
              : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
          }`}
        >
          ✏️ Edit
        </button>
        <button
          onClick={handleDelete}
          disabled={!isDeletable}
          title={!isDeletable ? "Cannot delete live class" : "Delete class"}
          className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            isDeletable
              ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md"
              : "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
          }`}
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
};

export default LiveClassCard;
