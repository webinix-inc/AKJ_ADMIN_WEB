import {
  DeleteOutlined,
  DownloadOutlined,
  EllipsisOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  GlobalOutlined
} from "@ant-design/icons";
import { Button, Dropdown, Popconfirm, Select, Space, Switch, message } from "antd";
import React, { useState } from "react";
import api from "../../api/axios";

// Custom styles for the dropdown (dark theme)
const dropdownStyles = `
  .course-actions-dropdown .ant-select-selector {
    background-color: #262626 !important;
    border-color: #404040 !important;
    color: #fafafa !important;
  }
  
  .course-actions-dropdown .ant-select-selection-item {
    color: #fafafa !important;
  }
  
  .course-actions-dropdown .ant-select-arrow {
    color: #a3a3a3 !important;
  }
  
  .ant-select-dropdown {
    background-color: #1a1a1a !important;
    border-radius: 8px !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
    border: 1px solid #333 !important;
  }
  
  .ant-select-item {
    padding: 8px 12px !important;
    border-radius: 4px !important;
    margin: 2px 4px !important;
    color: #d4d4d4 !important;
  }
  
  .ant-select-item:hover {
    background-color: #262626 !important;
  }
  
  .ant-select-item-option-selected {
    background-color: #333 !important;
    font-weight: 500 !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('course-actions-styles')) {
  const style = document.createElement('style');
  style.id = 'course-actions-styles';
  style.textContent = dropdownStyles;
  document.head.appendChild(style);
}

const CourseActions = ({ courseId, isPublished, onTogglePublish, onDelete, rootFolderId, subscriptionCount, bypassSubscriptionCheck = false }) => {
  const [downloadOption, setDownloadOption] = useState("web");
  const [downloadLoading, setDownloadLoading] = useState(false);

  const handleDownloadOptionChange = async (value) => {
    setDownloadOption(value);

    if (!rootFolderId) {
      message.warning("Course root folder not found. Cannot update download settings.");
      return;
    }

    setDownloadLoading(true);
    try {
      // Map UI options to backend values
      const downloadTypeMap = {
        "web": "web",
        "app_pdf": "app_pdf",
        "app_video": "app_video",
        "both": "both"
      };

      const downloadType = downloadTypeMap[value];
      const allowDownload = value !== "web"; // Web means no download, others allow download

      // Update course download settings
      await api.post("/admin/updateDownloads", {
        rootFolderId: rootFolderId,
        allowDownload: allowDownload
      });

      // Also update folder download type
      await api.put(`/folders/${rootFolderId}`, {
        downloadType: downloadType,
        isDownloadable: allowDownload
      });

      const optionLabels = {
        "web": "Web (View Only)",
        "app_pdf": "App (PDF Download)",
        "app_video": "App (Video Internal Only)",
        "both": "Both (All Downloads)"
      };

      message.success(`Download setting updated to: ${optionLabels[value]}`);
    } catch (error) {
      console.error("Error updating download settings:", error);
      message.error("Failed to update download settings. Please try again.");
    } finally {
      setDownloadLoading(false);
    }
  };



  const downloadOptions = [
    {
      value: "web",
      label: (
        <Space>
          <GlobalOutlined style={{ color: "#1890ff" }} />
          <span>Web Only</span>
          <span style={{ fontSize: "11px", color: "#666" }}>(View Only)</span>
        </Space>
      ),
    },
    {
      value: "app_pdf",
      label: (
        <Space>
          <DownloadOutlined style={{ color: "#52c41a" }} />
          <span>App PDF</span>
          <span style={{ fontSize: "11px", color: "#666" }}>(PDF Downloads)</span>
        </Space>
      ),
    },
    {
      value: "app_video",
      label: (
        <Space>
          <DownloadOutlined style={{ color: "#722ed1" }} />
          <span>App Video</span>
          <span style={{ fontSize: "11px", color: "#666" }}>(Video Internal)</span>
        </Space>
      ),
    },
    {
      value: "both",
      label: (
        <Space>
          <DownloadOutlined style={{ color: "#fa8c16" }} />
          <span>All Downloads</span>
          <span style={{ fontSize: "11px", color: "#666" }}>(PDF + Video)</span>
        </Space>
      ),
    },
  ];

  const menu = (
    <div
      onClick={(e) => {
        if (e && typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
      }}
      style={{
        padding: "16px",
        minWidth: "300px",
        background: "#1a1a1a",
        borderRadius: "12px",
        boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
        border: "1px solid #333"
      }}
    >
      {/* Publish Toggle */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          background: "#262626",
          borderRadius: "8px",
          border: "1px solid #333"
        }}>
          <Space>
            {isPublished ? (
              <EyeOutlined style={{ color: "#10b981", fontSize: "16px" }} />
            ) : (
              <EyeInvisibleOutlined style={{ color: "#737373", fontSize: "16px" }} />
            )}
            <span style={{ fontWeight: "600", fontSize: "14px", color: isPublished ? "#10b981" : "#a3a3a3" }}>
              {isPublished ? "Published" : "Unpublished"}
            </span>
          </Space>
          <Switch
            checked={isPublished}
            disabled={!isPublished && !bypassSubscriptionCheck && (!subscriptionCount || subscriptionCount === 0)}
            onChange={(checked) => {
              if (!isPublished && !bypassSubscriptionCheck && (!subscriptionCount || subscriptionCount === 0)) {
                message.error("Cannot publish: No subscription plans linked.");
                return;
              }
              onTogglePublish(courseId, checked);
            }}
            onClick={(checked, e) => {
              if (e && typeof e.stopPropagation === 'function') {
                e.stopPropagation();
              }
              if (!isPublished && !bypassSubscriptionCheck && (!subscriptionCount || subscriptionCount === 0)) {
                message.error("Cannot publish: No subscription plans linked.");
              }
            }}
            size="default"
            style={{ backgroundColor: isPublished ? "#10b981" : undefined }}
          />
        </div>
      </div>

      <div style={{ height: "1px", background: "#333", margin: "16px 0" }} />

      {/* Download Settings */}
      <div style={{ marginBottom: "16px" }}>
        <div style={{
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: "600",
          color: "#fafafa"
        }}>
          Download Settings {downloadLoading && "⏳"}
        </div>
        <Select
          value={downloadOption}
          onChange={handleDownloadOptionChange}
          options={downloadOptions}
          style={{ width: "100%" }}
          placeholder="Select download option"
          disabled={downloadLoading}
          className="course-actions-dropdown"
          size="middle"

          onClick={(e) => {
            if (e && typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
          }}
          onDropdownVisibleChange={(open) => {
            if (open) {
              document.addEventListener('click', (e) => {
                if (e && typeof e.stopPropagation === 'function') {
                  e.stopPropagation();
                }
              }, { once: true });
            }
          }}
        />
        <div style={{
          fontSize: "12px",
          color: "#737373",
          marginTop: "8px",
          display: "flex",
          gap: "6px",
          alignItems: "center"
        }}>
          <span style={{ fontSize: "14px" }}>💡</span> Controls how users can access course materials
        </div>
      </div>

      <div style={{ height: "1px", background: "#333", margin: "16px 0" }} />

      {/* Delete Action */}
      <div>
        <Button
          block
          size="large"
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={(e) => {
            if (e && typeof e.stopPropagation === 'function') {
              e.stopPropagation();
            }
            onDelete(courseId);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "600",
            borderRadius: "8px",
            height: "40px",
            backgroundColor: "#ef4444",
            borderColor: "#ef4444"
          }}
        >
          Delete Course
        </Button>
      </div>
    </div >
  );

  const handleDropdownClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
  };

  const handleButtonClick = (e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
  };

  return (
    <div onClick={handleDropdownClick}>
      <Dropdown
        dropdownRender={() => menu}
        trigger={["click"]}
        placement="bottomRight"
      >
        <Button
          icon={<EllipsisOutlined />}
          shape="circle"
          onClick={handleButtonClick}
          style={{
            border: "1px solid #d9d9d9",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        />
      </Dropdown>
    </div>
  );
};

export default CourseActions;
