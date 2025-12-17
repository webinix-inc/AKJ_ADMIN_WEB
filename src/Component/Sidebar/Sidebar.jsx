import React, { useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NavLink } from "react-router-dom";
import "./Sidebar.css";

import { FaChalkboardTeacher, FaUser, FaUserGraduate } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import {
  IoAnalyticsOutline,
  IoChatbubbleEllipsesOutline,
} from "react-icons/io5";
import { LuBookmarkMinus } from "react-icons/lu";
import { MdOutlineContentCopy, MdStore } from "react-icons/md";
import { TiDocumentText } from "react-icons/ti";
import { VscTools } from "react-icons/vsc";

const Sidebar = () => {
  const adminData = useSelector((state) => state.admin.adminData);
  const { permissions, userType } = adminData?.data || {};

  const [isUserManagementHovered, setUserManagementHovered] = useState(false);
  const [isReportHovered, setReportHovered] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);

  const userDropdownRef = useRef(null);
  const reportDropdownRef = useRef(null);

  const sidebarItems = [
    {
      text: "Home",
      link: "/home",
      icon: <GoHomeFill size={20} />,
      permission: true,
    },
    {
      text: "Courses & Tests",
      link: "/courses_tests/courses",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.coursesPermission,
    },
    {
      text: "Content",
      link: "/folder",
      icon: <MdOutlineContentCopy size={20} />,
      permission: permissions?.coursesPermission,
    },
    {
      text: "Test Panel",
      link: "/content/testpanel",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.testPortalPermission,
    },
    {
      text: "Book Store",
      link: "/bookStore",
      icon: <MdStore size={20} />,
      permission: permissions?.bookStorePermission,
    },
    {
      text: "Plans",
      link: "/plans",
      icon: <LuBookmarkMinus size={20} />,
      permission: permissions?.planPermission,
    },
    {
      text: "Messages",
      link: "/messages",
      icon: <IoChatbubbleEllipsesOutline size={20} />,
      permission: permissions?.chatPermission,
      messagecount: "4",
    },
    {
      text: "Marketing Services",
      link: "/selfservice",
      icon: <VscTools size={20} />,
      permission: permissions?.marketingServicesPermission,
    },
  ];

  const userManagementItem = {
    text: "User Management",
    icon: <FaUser size={20} />,
    permission: permissions?.peoplePermission,
  };

  const userSubItems = [
    {
      text: "Students",
      link: "/students",
      icon: <FaUserGraduate size={20} />,
      permission: permissions?.peoplePermission,
    },
    {
      text: "Teachers",
      link: "/teachers",
      icon: <FaChalkboardTeacher size={20} />,
      permission: permissions?.peoplePermission,
    },
  ];

  const reportAnalyticsItem = {
    text: "Report and Analytic",
    icon: <IoAnalyticsOutline size={20} />,
    permission: permissions?.reportAndAnalyticPermission,
  };

  const reportSubItems = [
    {
      text: "Course Orders",
      link: "/orders",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.reportAndAnalyticPermission,
    },
    {
      text: "Book Orders",
      link: "/books/orders",
      icon: <MdStore size={20} />,
      permission: permissions?.reportAndAnalyticPermission,
    },
  ];

  const handleMouseEnter = (setHover) => {
    clearTimeout(dropdownTimeout);
    setHover(true);
  };

  const handleMouseLeave = (setHover, ref) => {
    const timeout = setTimeout(() => {
      if (!ref.current?.matches(":hover")) {
        setHover(false);
      }
    }, 200);
    setDropdownTimeout(timeout);
  };

  return (
    <div className="sidebar">
      <div className="sidebar1">
        <div className="sidebar2">
          <h6>AKJ Classes</h6>
        </div>
        <div className="sidebar5">
          {sidebarItems
            .filter((item) => userType === "ADMIN" || item.permission)
            .map((item, index) => (
              <NavLink
                key={index}
                to={item.link}
                className="sidebar-link"
                activeClassName="active"
              >
                <div className="sidebar6">
                  <span>{item.icon}</span>
                  <p>{item.text}</p>
                  {item.messagecount && (
                    <div className="sidebarmessage">
                      <h6>{item.messagecount}</h6>
                    </div>
                  )}
                </div>
              </NavLink>
            ))}

          {/* Report and Analytic Dropdown */}
          {(userType === "ADMIN" || reportAnalyticsItem.permission) && (
            <>
              <div
                className="sidebar-link"
                onMouseEnter={() => handleMouseEnter(setReportHovered)}
                onMouseLeave={() =>
                  handleMouseLeave(setReportHovered, reportDropdownRef)
                }
              >
                <div className="sidebar6">
                  <span>{reportAnalyticsItem.icon}</span>
                  <p>{reportAnalyticsItem.text}</p>
                </div>
              </div>
              <div
                ref={reportDropdownRef}
                onMouseEnter={() => handleMouseEnter(setReportHovered)}
                onMouseLeave={() =>
                  handleMouseLeave(setReportHovered, reportDropdownRef)
                }
              >
                {isReportHovered && (
                  <div className="mt-0 flex flex-col right-0">
                    {reportSubItems
                      .filter((item) => userType === "ADMIN" || item.permission)
                      .map((subItem, index) => (
                        <NavLink
                          key={index}
                          to={subItem.link}
                          className="sidebar-link"
                          activeClassName="active"
                        >
                          <div className="sidebar6">
                            <span>{subItem.icon}</span>
                            <p>{subItem.text}</p>
                          </div>
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* User Management Dropdown */}
          {(userType === "ADMIN" || userManagementItem.permission) && (
            <>
              <div
                className="sidebar-link"
                onMouseEnter={() => handleMouseEnter(setUserManagementHovered)}
                onMouseLeave={() =>
                  handleMouseLeave(setUserManagementHovered, userDropdownRef)
                }
              >
                <div className="sidebar6">
                  <span>{userManagementItem.icon}</span>
                  <p>{userManagementItem.text}</p>
                </div>
              </div>
              <div
                ref={userDropdownRef}
                onMouseEnter={() => handleMouseEnter(setUserManagementHovered)}
                onMouseLeave={() =>
                  handleMouseLeave(setUserManagementHovered, userDropdownRef)
                }
              >
                {isUserManagementHovered && (
                  <div className="mt-0 flex flex-col right-0">
                    {userSubItems
                      .filter((item) => userType === "ADMIN" || item.permission)
                      .map((subItem, index) => (
                        <NavLink
                          key={index}
                          to={subItem.link}
                          className="sidebar-link"
                          activeClassName="active"
                        >
                          <div className="sidebar6">
                            <span>{subItem.icon}</span>
                            <p>{subItem.text}</p>
                          </div>
                        </NavLink>
                      ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
