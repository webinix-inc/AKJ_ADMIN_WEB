import { Pie } from "@ant-design/charts";
import { DownloadOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  Row,
  Col,
  Space,
  Avatar
} from "antd";
import { format, startOfToday, startOfYear, subDays } from "date-fns";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as XLSX from "xlsx";
import HOC from "../../Component/HOC/HOC";
import { fetchPaidOrders } from "../../redux/slices/orderSlice";
import "./Orders.css";

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="orders-container text-center text-red-500">
          <h2>Something went wrong. Please try again later.</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

const Orders = () => {
  const [filters, setFilters] = useState({
    dateRange: [],
    paymentType: "",
    courseType: "",
  });

  const [timeframe, setTimeframe] = useState(null);

  const dispatch = useDispatch();
  const { paidOrders, loading, error } = useSelector((state) => state.order);

  useEffect(() => {
    dispatch(fetchPaidOrders());
  }, [dispatch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const calculateTimeframeRevenue = () => {
    if (!timeframe)
      return paidOrders.reduce((acc, order) => acc + order.amount / 100, 0);

    const today = new Date();
    let start;

    switch (timeframe) {
      case "today":
        start = startOfToday();
        break;
      case "pastWeek":
        start = subDays(today, 7);
        break;
      case "pastMonth":
        start = subDays(today, 30);
        break;
      case "pastYear":
        start = startOfYear(today);
        break;
      default:
        return paidOrders.reduce((acc, order) => acc + order.amount / 100, 0);
    }

    return paidOrders
      .filter(
        (order) =>
          new Date(order.createdAt) >= start &&
          new Date(order.createdAt) <= today
      )
      .reduce((acc, order) => acc + order.amount / 100, 0);
  };

  const downloadReport = () => {
    const today = new Date();
    let start;

    switch (timeframe) {
      case "today":
        start = startOfToday();
        break;
      case "pastWeek":
        start = subDays(today, 7);
        break;
      case "pastMonth":
        start = subDays(today, 30);
        break;
      case "pastYear":
        start = startOfYear(today);
        break;
      default:
        start = null; // No timeframe filter applied
    }

    const filteredData = paidOrders
      ?.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const [startDate, endDate] = filters.dateRange || [];

        return (
          (!filters.paymentType || order.paymentMode === filters.paymentType) &&
          (!filters.courseType ||
            order.courseId?.title === filters.courseType) &&
          (!filters.dateRange.length ||
            (orderDate >= startDate && orderDate <= endDate)) &&
          (!start || (orderDate >= start && orderDate <= today)) // Apply timeframe filter
        );
      })
      .map((order) => ({
        "Full Name": `${order.userId?.firstName || ""} ${order.userId?.lastName || ""
          }`,
        "Course Name": order.courseId?.title || "No Course Assigned",
        "Enrolled Date": format(new Date(order.createdAt), "dd/MM/yyyy"),
        "Paid Amount": `Rs. ${(order.amount / 100).toFixed(2)}`,
        "Payment Mode": order.paymentMode || "N/A",
      }));

    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "Orders_Report.csv");
  };

  const courseColumns = [
    {
      title: "STUDENT",
      key: "student",
      render: (_, record) => (
        <Space size={12}>
          <Avatar src={record.userImage} size={40} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong className="text-white">{record.fullName}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "COURSE NAME",
      dataIndex: "courseName",
      key: "courseName",
      render: (text) => <Text className="text-gray-300">{text}</Text>
    },
    {
      title: "ENROLLED DATE",
      dataIndex: "enrolledDate",
      key: "enrolledDate",
      render: (text) => <Text className="text-gray-300">{text}</Text>
    },
    {
      title: "PAYMENT",
      key: "payment",
      render: (_, record) => (
        <Tag color={record.paymentMode === "full" ? "green" : "blue"}>
          {record.paymentMode === "installment"
            ? `${record.paidInstallments || 0}/${record.totalInstallments || 1} Paid`
            : "Full Payment"}
        </Tag>
      )
    },
    {
      title: "PAID AMOUNT",
      dataIndex: "paidAmount",
      key: "paidAmount",
      render: (amount) => <Text strong className="text-green-400">Rs. {amount}</Text>,
    },
  ];

  // 🔥 Calculate paid installments count per user+course combination
  const paidInstallmentsMap = paidOrders?.reduce((acc, order) => {
    if (order.paymentMode === "installment") {
      const key = `${order.userId?._id}-${order.courseId?._id}`;
      if (!acc[key]) {
        acc[key] = {
          paidCount: 0,
          totalInstallments: order.installmentDetails?.totalInstallments || 1
        };
      }
      acc[key].paidCount += 1;
    }
    return acc;
  }, {}) || {};

  const courseData =
    paidOrders
      ?.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const [start, end] = filters.dateRange || [];
        return (
          (!filters.paymentType || order.paymentMode === filters.paymentType) &&
          (!filters.courseType ||
            order.courseId?.title === filters.courseType) &&
          (!filters.dateRange.length ||
            (orderDate >= start && orderDate <= end))
        );
      })
      ?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      ?.map((order) => {
        const installmentKey = `${order.userId?._id}-${order.courseId?._id}`;
        const installmentInfo = paidInstallmentsMap[installmentKey] || { paidCount: 0, totalInstallments: 1 };

        return {
          key: order?._id || "unknown",
          userImage: order?.userId?.image || "https://via.placeholder.com/50",
          fullName: `${order?.userId?.firstName || ""} ${order?.userId?.lastName || ""
            }`.trim(),
          courseName: order?.courseId?.title || "No Course Assigned",
          enrolledDate: order?.createdAt
            ? format(new Date(order.createdAt), "dd/MM/yyyy")
            : "N/A",
          paidAmount: order?.amount ? (order.amount / 100).toFixed(2) : "0.00",
          paymentMode: order?.paymentMode || "N/A",
          installmentDetails: order?.installmentDetails || {},
          paidInstallments: installmentInfo.paidCount,
          totalInstallments: installmentInfo.totalInstallments,
        };
      }) || [];

  const totalRevenue = calculateTimeframeRevenue();

  const paymentData = paidOrders.reduce(
    (acc, order) => {
      acc[order.paymentMode === "full" ? "Full Payment" : "Installments"]++;
      return acc;
    },
    { "Full Payment": 0, Installments: 0 }
  );

  const courseDistribution = paidOrders.reduce((acc, order) => {
    const courseName = order.courseId?.title || "Unknown Course";
    acc[courseName] = (acc[courseName] || 0) + 1;
    return acc;
  }, {});

  const monthlyCourseData = paidOrders.reduce((acc, order) => {
    const month = format(new Date(order.createdAt), "MMMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const pieConfig = {
    appendPadding: 10,
    data: Object.entries(paymentData).map(([type, count]) => ({
      type,
      value: count,
    })),
    angleField: "value",
    colorField: "type",
    radius: 0.8,
    theme: "dark",
    label: false,
    legend: { position: 'top', itemValue: { style: { fill: '#fff' } }, itemName: { style: { fill: '#fff' } } },
    interactions: [{ type: 'element-active' }],
  };

  const allCoursesPieConfig = {
    appendPadding: 10,
    data: Object.entries(courseDistribution).map(([course, count]) => ({
      course,
      count,
    })),
    angleField: "count",
    colorField: "course",
    radius: 0.8,
    theme: "dark",
    label: false,
    legend: { position: 'top', itemValue: { style: { fill: '#fff' } }, itemName: { style: { fill: '#fff' } } },
    interactions: [{ type: 'element-active' }],
  };

  const monthWiseCourseConfig = {
    appendPadding: 10,
    data: Object.entries(monthlyCourseData).map(([month, count]) => ({
      month,
      count,
    })),
    angleField: "count",
    colorField: "month",
    radius: 0.8,
    theme: "dark",
    label: false,
    legend: { position: 'top', itemValue: { style: { fill: '#fff' } }, itemName: { style: { fill: '#fff' } } },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <ErrorBoundary>
      <div className="orders-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="page-title">Orders Dashboard</h1>
            <p style={{ color: '#888', marginTop: '4px' }}>Analyze revenue streams and order processing</p>
          </div>

          <Select
            className="dark-select"
            style={{ width: 180 }}
            placeholder="Select Timeframe"
            onChange={(value) => setTimeframe(value)}
            allowClear
          >
            <Option value="today">Today</Option>
            <Option value="pastWeek">Past Week</Option>
            <Option value="pastMonth">Past Month</Option>
            <Option value="pastYear">Past Year</Option>
          </Select>
        </div>

        {/* Filters Section */}
        <div className="glass-card mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8} lg={6}>
              <label className="dark-label">Date Range</label>
              <RangePicker
                className="dark-picker w-full"
                popupClassName="dark-range-picker-dropdown"
                style={{ width: '100%' }}
                onChange={(dates) => handleFilterChange("dateRange", dates)}
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <label className="dark-label">Payment Type</label>
              <Select
                className="dark-select w-full"
                placeholder="Payment Type"
                style={{ width: '100%' }}
                onChange={(value) => handleFilterChange("paymentType", value)}
                allowClear
              >
                <Option value="full">Full Payment</Option>
                <Option value="installment">Installment</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <label className="dark-label">Course Type</label>
              <Select
                className="dark-select w-full"
                placeholder="Course Type"
                style={{ width: '100%' }}
                onChange={(value) => handleFilterChange("courseType", value)}
                allowClear
              >
                {[...new Set(paidOrders?.map((order) => order?.courseId?.title))]
                  .filter(Boolean)
                  .map((course) => (
                    <Option key={course} value={course}>
                      {course}
                    </Option>
                  ))}
              </Select>
            </Col>
            <Col xs={24} lg={6} style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                type="primary"
                className="primary-btn w-full"
                icon={<DownloadOutlined />}
                onClick={downloadReport}
                style={{ width: '100%' }}
              >
                Download Report
              </Button>
            </Col>
          </Row>
        </div>

        {/* Stats & Charts */}
        <Row gutter={[24, 24]}>
          <Col xs={24}>
            <div className="stat-card mb-6">
              <div>
                <div className="stat-label">Total Revenue ({timeframe || "All Time"})</div>
                <div className="stat-value">Rs. {totalRevenue.toFixed(2)}</div>
              </div>
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} xl={8}>
            <div className="glass-card h-full">
              <h3 className="text-white mb-4 text-center">Payment Distribution</h3>
              <div className="chart-wrapper">
                <Pie {...pieConfig} />
              </div>
            </div>
          </Col>
          <Col xs={24} xl={8}>
            <div className="glass-card h-full">
              <h3 className="text-white mb-4 text-center">Course Distribution</h3>
              <div className="chart-wrapper">
                <Pie {...allCoursesPieConfig} />
              </div>
            </div>
          </Col>
          <Col xs={24} xl={8}>
            <div className="glass-card h-full">
              <h3 className="text-white mb-4 text-center">Monthly Enrolments</h3>
              <div className="chart-wrapper">
                <Pie {...monthWiseCourseConfig} />
              </div>
            </div>
          </Col>
        </Row>


        {/* Table Section */}
        <div className="glass-card">
          <div className="mb-4">
            <h3 className="text-white">Recent Orders</h3>
          </div>
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <Spin size="large" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center">{typeof error === 'object' ? error.message || JSON.stringify(error) : error}</div>
          ) : (
            <Table
              columns={courseColumns}
              dataSource={courseData}
              pagination={{ pageSize: 10, position: ['bottomCenter'] }}
              className="dark-table"
              scroll={{ x: 800 }}
            />
          )}
        </div>
      </div>
    </ErrorBoundary >
  );
};

export default HOC(Orders);
