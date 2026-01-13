import React from "react";
import HOC from "../../Component/HOC/HOC";
import './SelfService.css';

const VideoMarketing = () => {
  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">📹 Video Marketing</h1>
          <p className="page-subtitle">Manage your video marketing campaigns.</p>
        </div>
      </div>
      <div className="glass-card p-6 flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Under Construction</div>
      </div>
    </div>
  );
};

export default HOC(VideoMarketing);
