import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Alert, Tooltip } from "antd";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";

const { Title } = Typography;

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
      <div className="truncate-text">{text}</div>
    </Tooltip>
  );

  const columns = [
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text) => truncateWithTooltip(text, 18),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      key: "orderId",
      render: (text) => truncateWithTooltip(text, 18),
    },
    {
      title: "Book Image",
      dataIndex: ["book", "imageUrl"],
      key: "bookName",
      render: (imageUrl) => (
        <Tooltip title="Book Image">
          <img
            src={imageUrl}
            alt="Book"
            style={{ width: 50, height: 50, borderRadius: 5 }}
          />
        </Tooltip>
      ),
    },
    {
      title: "Customer",
      key: "customer",
      render: (_, record) =>
        truncateWithTooltip(`${record.user.firstName} ${record.user.lastName}`),
    },
    {
      title: "Email",
      dataIndex: ["user", "email"],
      key: "email",
      render: (text) => truncateWithTooltip(text),
    },
    {
      title: "Phone",
      dataIndex: ["user", "phone"],
      key: "phone",
      render: (text) => truncateWithTooltip(text),
    },
    {
      title: "Address",
      dataIndex: ["user", "address"],
      key: "address",
      render: (text) => truncateWithTooltip(text),
    },
    {
      title: "Book",
      dataIndex: ["book", "name"],
      key: "bookName",
      render: (text) => truncateWithTooltip(text),
    },
    {
      title: "Qty",
      dataIndex: "quantity",
      key: "quantity",
      align: "center",
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => `₹${amount.toFixed(2)}`,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: "#1f1f1f",
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <Title level={3} style={{ color: "#fff" }}>
        📦 All Book Orders
      </Title>

      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="_id"
          dataSource={orders}
          columns={columns}
          pagination={{ pageSize: 10 }}
          bordered
          style={{ backgroundColor: "#141414", color: "#fff" }}
        />
      )}
    </div>
  );
};

export default HOC(BookOrders);
