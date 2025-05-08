import React, { useState } from 'react';
import HOC from '../../Component/HOC/HOC';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa'; // Importing correctly from react-icons

const EntranceExam = () => {  // Component name should be capitalized
  const navigate = useNavigate();
  const [addBannerModalShow, setAddBannerModalShow] = useState(false);

  return (
    <div className='coursesEdit1'>
      <FaArrowLeft color='#FFFFFF' size={20} onClick={() => navigate('/selfservice')} />
      <h6>Entrance Exam</h6>
      <button onClick={() => setAddBannerModalShow(true)}>Add Banner</button>
    </div>
  );
};

export default HOC(EntranceExam);
