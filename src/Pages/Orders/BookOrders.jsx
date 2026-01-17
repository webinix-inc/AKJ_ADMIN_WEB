import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Alert, Tooltip, Avatar, Space } from "antd";
import { ShoppingOutlined, UserOutlined, BookOutlined } from "@ant-design/icons";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import "./Orders.css";

const { Title, Text } = Typography;

const BookOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders");
        if (data.success) setOrders(data.orders || data.data);
        else setError("Failed to load orders.");
      } catch (err) {
        console.error("❌ Error fetching orders:", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const truncateWithTooltip = (text, length = 20) => (
    <Tooltip title={text}>
      <div className="truncate-text" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
    </Tooltip>
  );

  const columns = [
    {
      title: "ORDER INFO",
      key: "orderInfo",
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text className="text-gray-400" style={{ fontSize: '12px' }}>Txn: {record.transactionId?.substring(0, 10)}...</Text>
          <Text className="text-white" strong>{record.orderId}</Text>
        </div>
      )
    },
    {
      title: "CUSTOMER",
      key: "customer",
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#2563eb' }} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong className="text-white">{record.user.firstName} {record.user.lastName}</Text>
            <Text className="text-gray-400" style={{ fontSize: '12px' }}>{record.user.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "BOOK",
      key: "book",
      render: (_, record) => (
        <Space>
          {record.book?.imageUrl ? (
            <img
              src={record.book.imageUrl}
              alt="Book"
              style={{ width: 40, height: 50, borderRadius: 4, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 40, height: 50, background: '#333', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOutlined style={{ color: '#888' }} />
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text className="text-white">{record.book?.name || "Unknown Book"}</Text>
            <Text className="text-gray-400" style={{ fontSize: '12px' }}>Qty: {record.quantity}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "AMOUNT",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => <Text strong className="text-green-400">₹{amount.toFixed(2)}</Text>,
    },
    {
      title: "DATE",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <Text className="text-gray-300">{new Date(date).toLocaleString()}</Text>,
    },
    {
      title: "ADDRESS",
      dataIndex: ["user", "address"],
      key: "address",
      render: (text) => truncateWithTooltip(text || "N/A"),
      width: 150
    }
  ];

  return (
    <div className="orders-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Book Orders</h1>
          <p style={{ color: '#888', marginTop: '4px' }}>Track and manage physical book shipments</p>
        </div>
      </div>

      <div className="glass-card">
        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 24, background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.2)', color: '#ffccc7' }}
          />
        )}

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            rowKey="_id"
            dataSource={orders}
            columns={columns}
            pagination={{ pageSize: 10, position: ['bottomCenter'] }}
            className="dark-table"
            scroll={{ x: 1000 }}
          />
        )}
      </div>
    </div>
  );
};

export default HOC(BookOrders);
