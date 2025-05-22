// import React, { useState, useEffect } from "react";
// import { Table, Typography, Spin, Modal } from "antd";
// import HOC from "../../Component/HOC/HOC";
// import api from "../../api/axios";
// import { Color } from "antd/es/color-picker";

// import { DatePicker, Button, Select, Space, message } from "antd";

// import dayjs from "dayjs";
// import { exportToCSV } from "../../Component/utils/exportCSV";

// const { RangePicker } = DatePicker;
// const { Option } = Select;

// const { Title } = Typography;

// const Enquiries = () => {
//   const [enquiries, setEnquiries] = useState([]); // State to store enquiries data
//   const [loading, setLoading] = useState(true); // State for loading spinner
//   const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility
//   const [modalContent, setModalContent] = useState(""); // State for modal content

//   useEffect(() => {
//     const fetchEnquiries = async () => {
//       try {
//         const response = await api.get("/enquiries");
//         setEnquiries(response.data);
//       } catch (error) {
//         console.error("Error fetching enquiries:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchEnquiries();
//   }, []);

//   // Show the modal with the full description
//   const handleShowModal = (description) => {
//     setModalContent(description);
//     setIsModalVisible(true);
//   };

//   // Close the modal
//   const handleCloseModal = () => {
//     setIsModalVisible(false);
//     setModalContent("");
//   };

//   // Define columns for the Ant Design Table
//   const columns = [
//     {
//       title: "Date",
//       dataIndex: "date",
//       key: "date",
//       render: (date) => new Date(date).toLocaleString(),
//     },
//     {
//       title: "Full Name",
//       dataIndex: "fullName",
//       key: "fullName",
//     },
//     {
//       title: "Phone",
//       dataIndex: "email",
//       key: "email",
//     },
//     {
//       title: "Course Name",
//       dataIndex: "courseName",
//       key: "courseName",
//     },
//     {
//       title: "Description",
//       dataIndex: "description",
//       key: "description",
//       render: (description) => (
//         <span
//           onMouseEnter={() => handleShowModal(description)}
//           className="cursor-pointer"
//         >
//           {description.length > 30
//             ? `${description.substring(0, 30)}...`
//             : description}
//         </span>
//       ),
//     },
//   ];

//   const [filterType, setFilterType] = useState("all");
//   const [dateRange, setDateRange] = useState([]);
//   const handleExport = () => {
//     let filtered = enquiries;

//     if (filterType === "today") {
//       const today = dayjs();
//       filtered = enquiries.filter((enq) =>
//         dayjs(enq.date).isSame(today, "day")
//       );
//     }

//     if (filterType === "month") {
//       const thisMonth = dayjs();
//       filtered = enquiries.filter((enq) =>
//         dayjs(enq.date).isSame(thisMonth, "month")
//       );
//     }

//     if (filterType === "range" && dateRange.length === 2) {
//       const [start, end] = dateRange;
//       filtered = enquiries.filter(
//         (enq) =>
//           dayjs(enq.date).isAfter(start.startOf("day")) &&
//           dayjs(enq.date).isBefore(end.endOf("day"))
//       );
//     }

//     if (filtered.length === 0) {
//       message.info("No enquiries match the selected filter.");
//       return;
//     }

//     const formatted = filtered.map(
//       ({ date, fullName, email, courseName, description }) => ({
//         Date: new Date(date).toLocaleString(),
//         Name: fullName,
//         Email: email,
//         Course: courseName,
//         Description: description,
//       })
//     );

//     exportToCSV(formatted, "filtered-enquiries.csv");
//   };

//   return (
//     <div className="p-6">
//       <Title style={{ color: "white" }} level={2} className=" mb-4">
//         Enquiries
//       </Title>

//       <Space direction="horizontal" size="middle" className="mb-4">
//         <Select
//           placeholder="Select Filter"
//           onChange={(value) => setFilterType(value)}
//           value={filterType}
//           style={{ width: 160 }}
//         >
//           <Option value="all">All</Option>
//           <Option value="today">Today</Option>
//           <Option value="month">This Month</Option>
//           <Option value="range">Custom Range</Option>
//         </Select>

//         {filterType === "range" && (
//           <RangePicker
//             onChange={(dates) => setDateRange(dates)}
//             value={dateRange}
//           />
//         )}

//         <Button type="primary" onClick={handleExport}>
//           Export
//         </Button>
//       </Space>

//       <div className="bg-white p-4 shadow-md rounded-lg">
//         {loading ? (
//           <div className="flex justify-center items-center py-10">
//             <Spin size="large" />
//           </div>
//         ) : (
//           <Table
//             dataSource={enquiries}
//             columns={columns}
//             rowKey="_id"
//             pagination={{
//               pageSize: 10,
//               showSizeChanger: true,
//               pageSizeOptions: ["5", "10", "20"],
//             }}
//           />
//         )}
//         <Modal
//           visible={isModalVisible}
//           title="Full Description"
//           onCancel={handleCloseModal}
//           footer={null}
//           maskClosable
//           centered
//           destroyOnClose
//         >
//           <p>{modalContent}</p>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default HOC(Enquiries);

import React, { useState, useEffect } from "react";
import {
  Table,
  Typography,
  Spin,
  Modal,
  DatePicker,
  Button,
  Select,
  Space,
  message,
} from "antd";
import HOC from "../../Component/HOC/HOC";
import api from "../../api/axios";
import dayjs from "dayjs";
import { exportToCSV } from "../../Component/utils/exportCSV";

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const response = await api.get("/enquiries");
        setEnquiries(response.data);
        setFilteredEnquiries(response.data); // Initially show all
      } catch (error) {
        console.error("Error fetching enquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  // Filtering logic
  const getFilteredEnquiries = () => {
    if (filterType === "today") {
      const today = dayjs();
      return enquiries.filter((enq) => dayjs(enq.date).isSame(today, "day"));
    }

    if (filterType === "month") {
      const thisMonth = dayjs();
      return enquiries.filter((enq) =>
        dayjs(enq.date).isSame(thisMonth, "month")
      );
    }

    if (filterType === "range" && dateRange.length === 2) {
      const [start, end] = dateRange;
      return enquiries.filter(
        (enq) =>
          dayjs(enq.date).isAfter(start.startOf("day")) &&
          dayjs(enq.date).isBefore(end.endOf("day"))
      );
    }

    return enquiries; // 'all' case
  };

  // Triggered when filter changes
  useEffect(() => {
    const result = getFilteredEnquiries();
    setFilteredEnquiries(result);
  }, [filterType, dateRange, enquiries]);

  // Show modal
  const handleShowModal = (description) => {
    setModalContent(description);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setModalContent("");
  };

  const handleExport = () => {
    const filtered = getFilteredEnquiries();

    if (filtered.length === 0) {
      message.info("No enquiries match the selected filter.");
      return;
    }

    const formatted = filtered.map(
      ({ date, fullName, email, courseName, description }) => ({
        Date: new Date(date).toLocaleString(),
        Name: fullName,
        Email: email,
        Course: courseName,
        Description: description,
      })
    );

    exportToCSV(formatted, "filtered-enquiries.csv");
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
    },
    {
      title: "Phone",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Course Name",
      dataIndex: "courseName",
      key: "courseName",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (description) => (
        <span
          onMouseEnter={() => handleShowModal(description)}
          className="cursor-pointer"
        >
          {description.length > 30
            ? `${description.substring(0, 30)}...`
            : description}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Title style={{ color: "white" }} level={2} className="mb-4">
        Enquiries
      </Title>

      <Space direction="horizontal" size="middle" className="mb-4">
        <Select
          placeholder="Select Filter"
          onChange={(value) => setFilterType(value)}
          value={filterType}
          style={{ width: 160 }}
        >
          <Option value="all">All</Option>
          <Option value="today">Today</Option>
          <Option value="month">This Month</Option>
          <Option value="range">Custom Range</Option>
        </Select>

        {filterType === "range" && (
          <RangePicker
            onChange={(dates) => setDateRange(dates)}
            value={dateRange}
          />
        )}

        <Button type="primary" onClick={handleExport}>
          Export
        </Button>
      </Space>

      <div className="bg-white p-4 shadow-md rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={filteredEnquiries}
            columns={columns}
            rowKey="_id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              pageSizeOptions: ["5", "10", "20"],
            }}
          />
        )}
        <Modal
          visible={isModalVisible}
          title="Full Description"
          onCancel={handleCloseModal}
          footer={null}
          maskClosable
          centered
          destroyOnClose
        >
          <p>{modalContent}</p>
        </Modal>
      </div>
    </div>
  );
};

export default HOC(Enquiries);
