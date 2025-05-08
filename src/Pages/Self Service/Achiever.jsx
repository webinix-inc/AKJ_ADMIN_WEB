import React, { useState, useEffect } from "react";
import HOC from "../../Component/HOC/HOC";
import { PlusCircleOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Modal, Button, Table, Upload, InputNumber, message } from "antd";
import api from "../../api/axios";

const { confirm } = Modal;

const Achiever = () => {
  const [achievers, setAchievers] = useState([]);
  const [newAchiever, setNewAchiever] = useState({ photos: [], year: "", id: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [fullImageModal, setFullImageModal] = useState(false);
  const [fullImageSrc, setFullImageSrc] = useState("");

  useEffect(() => {
    const fetchAchievers = async () => {
      try {
        const response = await api.get("/achievers");
        setAchievers(response.data);
      } catch (error) {
        console.error("Error fetching achievers:", error);
      }
    };
    fetchAchievers();
  }, []);

  const openAchieverModal = (achiever = { photos: [], year: "", id: "" }) => {
    setNewAchiever(achiever);
    setImagePreview(achiever.photos.map(photo => ({
      uid: photo,
      name: 'Image.jpg',
      status: 'done',
      url: photo
    })));
    setIsEditing(achiever.id !== "");
    setShowModal(true);
  };

  const handleAddOrEditAchiever = async () => {
    const formData = new FormData();
    newAchiever.photos.forEach(photo => {
      if (photo.originFileObj) { // Handle newly uploaded files
        formData.append('photo', photo.originFileObj);
      }
    });
    formData.append('year', newAchiever.year);

    const endpoint = isEditing ? `/achievers/${newAchiever.id}` : '/achievers';
    const method = isEditing ? 'put' : 'post';

    try {
      const response = await api[method](endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setAchievers(isEditing ? achievers.map((ach) => ach.id === newAchiever.id ? response.data : ach) : [...achievers, response.data]);
      setShowModal(false);
      resetAchieverForm();
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} achiever:`, error);
    }
  };

  const showDeleteConfirm = (id) => {
    confirm({
      title: 'Are you sure delete this achiever?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone',
      onOk() {
        handleDeleteAchiever(id);
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const handleDeleteAchiever = async (id) => {
    try {
      await api.delete(`/achievers/${id}`);
      setAchievers(achievers.filter((achiever) => achiever.id !== id));
    } catch (error) {
      console.error("Error deleting achiever:", error);
    }
  };

  const handleImageChange = ({ fileList }) => {
    setImagePreview(fileList);
    setNewAchiever(prevState => ({ ...prevState, photos: fileList }));
  };

  const resetAchieverForm = () => {
    setNewAchiever({ photos: [], year: "", id: "" });
    setImagePreview([]);
  };

  const openFullImageModal = (imageSrc) => {
    setFullImageSrc(imageSrc);
    setFullImageModal(true);
  };

  const columns = [
    {
      title: 'Photo',
      dataIndex: 'photos',
      key: 'photos',
      render: (text, record) => (
        record.photos.map((photo, index) => (
          <img key={index}
            src={photo}
            alt="Achiever"
            width="50"
            height="50"
            style={{ cursor: "pointer", marginRight: "5px" }}
            onClick={() => openFullImageModal(photo)}
          />
        ))
      )
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button icon={<EditOutlined />} onClick={() => openAchieverModal(record)} />
          <Button icon={<DeleteOutlined />} onClick={() => showDeleteConfirm(record.id)} style={{ marginLeft: 8 }} />
        </>
      )
    },
  ];

  return (
    <div className="container p-4">
      <Button icon={<PlusCircleOutlined />} onClick={() => openAchieverModal()} style={{ marginBottom: 16 }}>
        Add Achiever
      </Button>
      <Table columns={columns} dataSource={achievers} rowKey="id" />

      <Modal
        title={isEditing ? "Edit Achiever" : "Add Achiever"}
        visible={showModal}
        onCancel={() => setShowModal(false)}
        footer={[
          <Button key="back" onClick={() => setShowModal(false)}>
            Close
          </Button>,
          <Button key="submit" type="primary" onClick={handleAddOrEditAchiever}>
            {isEditing ? "Save Changes" : "Add Achiever"}
          </Button>,
        ]}
      >
        <Upload
          listType="picture-card"
          fileList={imagePreview}
          onChange={handleImageChange}
          beforeUpload={() => false}
          onPreview={(file) => openFullImageModal(file.url || file.thumbUrl)}
        >
          {imagePreview.length < 1 && '+ Upload'}
        </Upload>

        <div className="form-group">
          <label>Year:</label>
          <InputNumber
            className="ant-input"
            min={1900}
            max={new Date().getFullYear()}
            style={{ width: '100%' }}
            value={newAchiever.year}
            onChange={value => setNewAchiever(prev => ({ ...prev, year: value }))}
            placeholder="Enter Year (e.g., 2023)"
          />
        </div>
      </Modal>

      <Modal
        title="Full Image"
        visible={fullImageModal}
        onCancel={() => setFullImageModal(false)}
        footer={[
          <Button key="back" onClick={() => setFullImageModal(false)}>
            Close
          </Button>
        ]}
      >
        <img src={fullImageSrc} alt="Full-size Achiever" style={{ width: "100%" }} />
      </Modal>
    </div>
  );
};

export default HOC(Achiever);