import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Alert, Tooltip, Avatar, Space, Button } from "antd";
import { UserOutlined, BookOutlined, DownloadOutlined } from "@ant-design/icons";
import api from "../../api/axios";
import HOC from "../../Component/HOC/HOC";
import * as XLSX from "xlsx";
import "./Orders.css";

const { Text } = Typography;

const BookImage = ({ src, alt = "Book" }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div style={{ width: 40, height: 50, background: '#333', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <BookOutlined style={{ color: '#888' }} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      style={{ width: 40, height: 50, borderRadius: 4, objectFit: 'cover' }}
    />
  );
};

const BookOrders = () => {
  const [orders, setOrders] = useState([]);
  const [booksMap, setBooksMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrdersAndBooks = async () => {
      try {
        // Fetch orders and books in parallel
        const [ordersRes, booksRes] = await Promise.all([
          api.get("/orders"),
          api.get("/admin/books")
        ]);

        // Process orders
        if (ordersRes.data.success) {
          const sortedOrders = (ordersRes.data.orders || ordersRes.data.data).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          console.log("Fetched Orders:", sortedOrders);
          setOrders(sortedOrders);
        } else {
          setError("Failed to load orders.");
        }

        // Create a book name -> imageUrl lookup map
        if (booksRes.data && Array.isArray(booksRes.data)) {
          const bookLookup = {};
          booksRes.data.forEach(book => {
            if (book.name && book.imageUrl) {
              bookLookup[book.name.toLowerCase()] = book.imageUrl;
            }
          });
          console.log("Books lookup map created:", Object.keys(bookLookup).length, "entries");
          setBooksMap(bookLookup);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        setError("Failed to fetch orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrdersAndBooks();
  }, []);

  const truncateWithTooltip = (text, length = 20) => (
    <Tooltip title={text}>
      <div className="truncate-text" style={{ maxWidth: '150px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{text}</div>
    </Tooltip>
  );

  const downloadReport = () => {
    const dataToExport = orders.map((order) => ({
      "Order ID": order.orderId,
      "Transaction ID": order.transactionId,
      "Customer Name": `${order.user?.firstName || ""} ${order.user?.lastName || ""}`.trim(),
      "Email": order.user?.email || "N/A",
      "Book Name": order.book?.name || "Unknown Book",
      "Quantity": order.quantity || 1,
      "Total Amount": order.totalAmount ? `₹${order.totalAmount.toFixed(2)}` : "0.00",
      "Order Date": new Date(order.createdAt).toLocaleString(),
      "Address": order.user?.address || "N/A"
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Book Orders");
    XLSX.writeFile(workbook, "Book_Orders_Report.csv");
  };

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
            <Text strong className="text-white">{record.user?.firstName} {record.user?.lastName}</Text>
            <Text className="text-gray-400" style={{ fontSize: '12px' }}>{record.user?.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "BOOK",
      key: "book",
      render: (_, record) => {
        // Get imageUrl from order, or fallback to booksMap lookup
        const bookName = record.book?.name?.toLowerCase() || "";
        const imageUrl = record.book?.imageUrl || booksMap[bookName] || "";

        return (
          <Space>
            <BookImage src={imageUrl} alt={record.book?.name} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Text className="text-white">{record.book?.name || "Unknown Book"}</Text>
              <Text className="text-gray-400" style={{ fontSize: '12px' }}>Qty: {record.quantity}</Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: "AMOUNT",
      dataIndex: "totalAmount",
      key: "totalAmount",
      align: "right",
      render: (amount) => <Text strong className="text-green-400">₹{amount ? amount.toFixed(2) : "0.00"}</Text>,
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
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          onClick={downloadReport}
          disabled={orders.length === 0}
        >
          Download Report
        </Button>
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
