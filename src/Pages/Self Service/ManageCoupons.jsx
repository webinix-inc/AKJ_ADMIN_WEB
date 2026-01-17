import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { fetchAllCoupons, deleteCoupon } from "../../redux/slices/couponSlice";
import { Table, Button, Space, Tag, Modal, Tooltip } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import HOC from "../../Component/HOC/HOC";
import './SelfService.css';

const { confirm } = Modal;

const ManageCoupons = () => {
  const dispatch = useDispatch();
  const { coupons, loading } = useSelector((state) => state.coupons);

  useEffect(() => {
    dispatch(fetchAllCoupons());
  }, [dispatch]);

  const handleDelete = (id) => {
    confirm({
      title: 'Are you sure you want to delete this coupon?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'No',
      className: 'dark-modal',
      onOk() {
        dispatch(deleteCoupon(id));
      },
    });
  };

  const columns = [
    {
      title: 'Offer Name',
      dataIndex: 'offerName',
      key: 'offerName',
      render: (text) => <span className="font-semibold">{text}</span>,
    },
    {
      title: 'Coupon Code',
      dataIndex: 'couponCode',
      key: 'couponCode',
      render: (text) => <Tag color="blue" className="text-base px-3 py-1">{text}</Tag>,
    },
    {
      title: 'Type',
      dataIndex: 'couponType',
      key: 'couponType',
      render: (type) => (
        <Tag color={type === 'Public' ? 'green' : 'gold'}>
          {type}
        </Tag>
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (_, record) => (
        <span className="text-green-400 font-medium">
          {record.discountType === "Percentage"
            ? `${record.discountPercentage}% OFF`
            : `₹${record.discountAmount} OFF`}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit">
            <Link to={`/selfservice/editcoupon/${record._id}`}>
              <Button type="primary" shape="circle" icon={<EditOutlined />} />
            </Link>
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="primary"
              danger
              shape="circle"
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="self-service-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎟️ Manage Coupons</h1>
          <p className="page-subtitle">Create and manage discount codes for your courses.</p>
        </div>
        <Link to="/selfservice/addcoupon">
          <button className="primary-btn flex items-center gap-2">
            <PlusOutlined /> Create Coupon
          </button>
        </Link>
      </div>

      <div className="glass-card p-6">
        <Table
          columns={columns}
          dataSource={coupons}
          rowKey="_id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          className="dark-table"
        />
      </div>
    </div>
  );
};

export default HOC(ManageCoupons);
