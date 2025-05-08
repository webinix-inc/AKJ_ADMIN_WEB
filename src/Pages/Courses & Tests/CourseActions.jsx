import React, { useState } from "react";
import { Dropdown, Menu, Switch, Popconfirm, message, Button, Radio } from "antd";
import { EllipsisOutlined } from "@ant-design/icons";

const CourseActions = ({ courseId, isPublished, onTogglePublish, onDelete }) => {
  const [downloadOption, setDownloadOption] = useState("For Web");
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const handleDownloadOptionChange = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setDownloadOption(e.target.value);
    message.info(`Download option set to: ${e.target.value}`);
  };

  const handleMenuClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
  };

  const menu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="publish" onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
        <Switch
          checked={isPublished}
          onChange={(checked) => {
            onTogglePublish(courseId, checked);
          }}
        />
        <span style={{ marginLeft: 10 }}>Published</span>
      </Menu.Item>
      <Menu.Item key="download" onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
        <span
          onMouseEnter={() => setShowDownloadOptions(true)}
          onMouseLeave={() => setShowDownloadOptions(false)}
        >
          Course Material Downloadable
          {showDownloadOptions && (
            <div className="download-options" onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
              <Radio.Group
                onChange={handleDownloadOptionChange}
                value={downloadOption}
              >
                <Radio value="For Web">For Web</Radio>
                <Radio value="For App">For App</Radio>
                <Radio value="For App video internal only">
                  For App video internal only
                </Radio>
                <Radio value="For both">For both</Radio>
              </Radio.Group>
            </div>
          )}
        </span>
      </Menu.Item>
      <Menu.Item key="delete" onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
        <Popconfirm
          title="Are you sure you want to delete this course?"
          onConfirm={() => onDelete(courseId)}
          okText="Yes"
          cancelText="No"
        >
          <Button type="primary" danger onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
            Delete
          </Button>
        </Popconfirm>
      </Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu} trigger={["click"]} onClick={(e) => e?.stopPropagation && e.stopPropagation()}>
      <Button icon={<EllipsisOutlined />} shape="circle" onClick={(e) => e?.stopPropagation && e.stopPropagation()} />
    </Dropdown>
  );
};

export default CourseActions;
