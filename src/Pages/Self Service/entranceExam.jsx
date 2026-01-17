import React, { useState } from 'react';
import HOC from '../../Component/HOC/HOC';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import './SelfService.css';

const EntranceExam = () => {
  const navigate = useNavigate();
  // eslint-disable-next-line no-unused-vars
  const [addBannerModalShow, setAddBannerModalShow] = useState(false);

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            className="text-white hover:text-blue-400 p-0 mr-2"
            onClick={() => navigate("/selfservice")}
          >
            Back
          </Button>
          <span className="page-title align-middle">📝 Entrance Exam</span>
          <p className="page-subtitle ml-8">Manage entrance exams and banners.</p>
        </div>
        <button className="primary-btn flex items-center gap-2" onClick={() => setAddBannerModalShow(true)}>
          <PlusOutlined /> Add Banner
        </button>
      </div>

      <div className="glass-card p-6 flex justify-center items-center h-64">
        <div className="text-gray-400 text-lg">Under Construction</div>
      </div>
    </div>
  );
};

export default HOC(EntranceExam);
