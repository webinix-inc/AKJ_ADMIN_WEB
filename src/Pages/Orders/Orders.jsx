// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchPaidOrders } from "../../redux/slices/orderSlice";
// import {
//   Table,
//   Tag,
//   Spin,
//   Typography,
//   Button,
//   DatePicker,
//   Select,
//   Statistic,
// } from "antd";
// import { DownloadOutlined } from "@ant-design/icons";
// import { format, subDays, startOfToday, startOfYear } from "date-fns";
// import * as XLSX from "xlsx";
// import { Pie, Line } from "@ant-design/charts"; // Add Line chart import
// import HOC from "../../Component/HOC/HOC";
// import "antd/dist/reset.css";
// import "./Orders.css";

// const { Text } = Typography;
// const { RangePicker } = DatePicker;
// const { Option } = Select;

// class ErrorBoundary extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = { hasError: false };
//   }

//   static getDerivedStateFromError() {
//     return { hasError: true };
//   }

//   componentDidCatch(error, errorInfo) {
//     console.error("ErrorBoundary caught an error", error, errorInfo);
//   }

//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="text-center text-red-500">
//           <h2>Something went wrong. Please try again later.</h2>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const Orders = () => {
//   const [filters, setFilters] = useState({
//     dateRange: [],
//     paymentType: "",
//     courseType: "",
//   });

//   const [timeframe, setTimeframe] = useState(null);

//   const dispatch = useDispatch();
//   const { paidOrders, loading, error } = useSelector((state) => state.order);

//   useEffect(() => {
//     dispatch(fetchPaidOrders());
//   }, [dispatch]);

//   const handleFilterChange = (key, value) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   const calculateTimeframeRevenue = () => {
//     if (!timeframe)
//       return paidOrders.reduce((acc, order) => acc + order.amount / 100, 0);

//     const today = new Date();
//     let start;

//     switch (timeframe) {
//       case "today":
//         start = startOfToday();
//         break;
//       case "pastWeek":
//         start = subDays(today, 7);
//         break;
//       case "pastMonth":
//         start = subDays(today, 30);
//         break;
//       case "pastYear":
//         start = startOfYear(today);
//         break;
//       default:
//         return paidOrders.reduce((acc, order) => acc + order.amount / 100, 0);
//     }

//     return paidOrders
//       .filter(
//         (order) =>
//           new Date(order.createdAt) >= start &&
//           new Date(order.createdAt) <= today
//       )
//       .reduce((acc, order) => acc + order.amount / 100, 0);
//   };

//   const downloadReport = () => {
//     const today = new Date();
//     let start;

//     switch (timeframe) {
//       case "today":
//         start = startOfToday();
//         break;
//       case "pastWeek":
//         start = subDays(today, 7);
//         break;
//       case "pastMonth":
//         start = subDays(today, 30);
//         break;
//       case "pastYear":
//         start = startOfYear(today);
//         break;
//       default:
//         start = null; // No timeframe filter applied
//     }

//     const filteredData = paidOrders
//       ?.filter((order) => {
//         const orderDate = new Date(order.createdAt);
//         const [startDate, endDate] = filters.dateRange || [];

//         return (
//           (!filters.paymentType || order.paymentMode === filters.paymentType) &&
//           (!filters.courseType ||
//             order.courseId?.title === filters.courseType) &&
//           (!filters.dateRange.length ||
//             (orderDate >= startDate && orderDate <= endDate)) &&
//           (!start || (orderDate >= start && orderDate <= today)) // Apply timeframe filter
//         );
//       })
//       .map((order) => ({
//         "Full Name": `${order.userId?.firstName || ""} ${
//           order.userId?.lastName || ""
//         }`,
//         "Course Name": order.courseId?.title || "No Course Assigned",
//         "Enrolled Date": format(new Date(order.createdAt), "dd/MM/yyyy"),
//         "Paid Amount": `Rs. ${(order.amount / 100).toFixed(2)}`,
//         "Payment Mode": order.paymentMode || "N/A",
//       }));

//     const worksheet = XLSX.utils.json_to_sheet(filteredData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
//     XLSX.writeFile(workbook, "Orders_Report.xlsx");
//   };

//   const courseColumns = [
//     {
//       title: "Image",
//       dataIndex: "userImage",
//       key: "userImage",
//       render: (image) => (
//         <img
//           src={image || "https://via.placeholder.com/50"}
//           alt="User"
//           className="rounded-full w-14 h-14"
//           onError={(e) => {
//             e.target.src = "https://via.placeholder.com/50";
//           }}
//         />
//       ),
//     },
//     {
//       title: "Full Name",
//       dataIndex: "fullName",
//       key: "fullName",
//       render: (text, record) => (
//         <span>
//           {text}{" "}
//           <Tag color={record.paymentMode === "full" ? "green" : "blue"}>
//             {record.paymentMode === "installment"
//               ? `${record.installmentDetails?.installmentIndex + 1 || 1}/${
//                   record.installmentDetails?.totalInstallments || 1
//                 } Installment`
//               : "Full"}
//           </Tag>
//         </span>
//       ),
//     },
//     {
//       title: "Course Name",
//       dataIndex: "courseName",
//       key: "courseName",
//     },
//     {
//       title: "Enrolled Date",
//       dataIndex: "enrolledDate",
//       key: "enrolledDate",
//     },
//     {
//       title: "Paid Amount",
//       dataIndex: "paidAmount",
//       key: "paidAmount",
//       render: (amount) => `Rs. ${amount}`,
//     },
//   ];

//   const courseData =
//     paidOrders
//       ?.filter((order) => {
//         const orderDate = new Date(order.createdAt);
//         const [start, end] = filters.dateRange || [];
//         return (
//           (!filters.paymentType || order.paymentMode === filters.paymentType) &&
//           (!filters.courseType ||
//             order.courseId?.title === filters.courseType) &&
//           (!filters.dateRange.length ||
//             (orderDate >= start && orderDate <= end))
//         );
//       })
//       ?.map((order) => ({
//         key: order?._id || "unknown",
//         userImage: order?.userId?.image || "https://via.placeholder.com/50",
//         fullName: `${order?.userId?.firstName || ""} ${
//           order?.userId?.lastName || ""
//         }`.trim(),
//         courseName: order?.courseId?.title || "No Course Assigned",
//         enrolledDate: order?.createdAt
//           ? format(new Date(order.createdAt), "dd/MM/yyyy")
//           : "N/A",
//         paidAmount: order?.amount ? (order.amount / 100).toFixed(2) : "0.00",
//         paymentMode: order?.paymentMode || "N/A",
//         installmentDetails: order?.installmentDetails || {},
//       })) || [];

//   const totalRevenue = calculateTimeframeRevenue();

//   const lifetimeRevenue = paidOrders.reduce(
//     (acc, order) => acc + order.amount / 100,
//     0
//   );

//   const paymentData = paidOrders.reduce(
//     (acc, order) => {
//       acc[order.paymentMode === "full" ? "Full Payment" : "Installments"]++;
//       return acc;
//     },
//     { "Full Payment": 0, Installments: 0 }
//   );

//   const courseDistribution = paidOrders.reduce((acc, order) => {
//     const courseName = order.courseId?.title || "Unknown Course";
//     acc[courseName] = (acc[courseName] || 0) + 1;
//     return acc;
//   }, {});

//   const monthlyCourseData = paidOrders.reduce((acc, order) => {
//     const month = format(new Date(order.createdAt), "MMMM yyyy");
//     acc[month] = (acc[month] || 0) + 1;
//     return acc;
//   }, {});

//   const pieConfig = {
//     appendPadding: 10,
//     data: Object.entries(paymentData).map(([type, count]) => ({
//       type,
//       value: count,
//     })),
//     angleField: "value",
//     colorField: "type",
//     radius: 0.8,
//     theme: "dark",
//   };

//   const allCoursesPieConfig = {
//     appendPadding: 10,
//     data: Object.entries(courseDistribution).map(([course, count]) => ({
//       course,
//       count,
//     })),
//     angleField: "count",
//     colorField: "course",
//     radius: 0.8,
//     theme: "dark",
//   };

//   const monthWiseCourseConfig = {
//     appendPadding: 10,
//     data: Object.entries(monthlyCourseData).map(([month, count]) => ({
//       month,
//       count,
//     })),
//     angleField: "count",
//     colorField: "month",
//     radius: 0.8,
//     theme: "dark",
//   };

//   return (
//     <ErrorBoundary>
//       <div
//         className="p-6 min-h-screen"
//         style={{ backgroundColor: "#141414", color: "#fff" }}>
//         <h1 className="text-xl font-semibold mb-4">Orders Dashboard</h1>
//         <div className="bg-gray-800 shadow-md rounded-lg p-4 mb-6">
//           <div className="flex justify-between items-center text-white">
//             <RangePicker
//               onChange={(dates) => handleFilterChange("dateRange", dates)}
//             />
//             <Select
//               placeholder="Select Payment Type"
//               onChange={(value) => handleFilterChange("paymentType", value)}
//               allowClear>
//               <Option value="full">Full</Option>
//               <Option value="installment">Installment</Option>
//             </Select>
//             <Select
//               placeholder="Select Course Type"
//               onChange={(value) => handleFilterChange("courseType", value)}
//               allowClear>
//               {[...new Set(paidOrders?.map((order) => order?.courseId?.title))]
//                 .filter(Boolean)
//                 .map((course) => (
//                   <Option key={course} value={course}>
//                     {course}
//                   </Option>
//                 ))}
//             </Select>
//             <Button
//               icon={<DownloadOutlined />}
//               type="primary"
//               onClick={downloadReport}>
//               Download Report
//             </Button>
//           </div>
//         </div>

//         <div className="statistic-container bg-gray-800 p-4 rounded-lg shadow-md">
//           <div className="statistic-title flex justify-between items-center mb-4">
//             <div className="flex items-center gap-2 ">
//               <h4 className="text-white mt-2 text-lg">Total Revenue:</h4>
//               <Statistic
//                 value={`Rs. ${totalRevenue.toFixed(2)}`}
//                 textStyle={{ color: "white" }}
//                 valueStyle={{ fontSize: "20px", color: "white" }}
//               />
//             </div>
//             <Select
//               className="select-timeframe bg-gray-700 text-white border-none"
//               dropdownClassName="bg-white"
//               placeholder="Select Timeframe"
//               onChange={(value) => setTimeframe(value)}
//               valueStyle={{ fontSize: "24px", color: "white" }}
//               allowClear>
//               <Option value="today">Today</Option>
//               <Option value="pastWeek">Past Week</Option>
//               <Option value="pastMonth">Past Month</Option>
//               <Option value="pastYear">Past Year</Option>
//             </Select>
//           </div>
//         </div>

//         <div>
//           <h2 className="text-lg font-medium mb-4">Analytics</h2>
//           <div className="flex flex-wrap gap-4">
//             <div
//               style={{
//                 width: "350px",
//                 height: "350px",
//                 overflow: "hidden",
//               }}
//               className="flex-1 min-w-[300px]">
//               <Pie {...pieConfig} />
//             </div>
//             <div
//               style={{
//                 width: "350px",
//                 height: "350px",
//                 overflow: "hidden",
//               }}
//               className="flex-1 min-w-[300px]">
//               <Pie {...allCoursesPieConfig} />
//             </div>
//             <div
//               style={{
//                 width: "350px",
//                 height: "350px",
//                 overflow: "hidden",
//               }}
//               className="flex-1 min-w-[300px]">
//               <Pie {...monthWiseCourseConfig} />
//             </div>
//           </div>
//         </div>
//         <div className="mt-6">
//           {loading ? (
//             <div className="flex justify-center items-center">
//               <Spin size="large" />
//             </div>
//           ) : error ? (
//             <div className="text-red-500 text-center">{error}</div>
//           ) : (
//             <Table
//               columns={courseColumns}
//               dataSource={courseData}
//               bordered
//               pagination={{ pageSize: 5 }}
//               className="shadow-lg bg-gray-800 rounded-lg text-white"
//             />
//           )}
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default HOC(Orders);
