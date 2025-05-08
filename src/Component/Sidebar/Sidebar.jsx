import React, { useState, useRef } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { GoHomeFill } from "react-icons/go";
import { TiDocumentText } from "react-icons/ti";
import { MdOutlineContentCopy, MdStore } from "react-icons/md";
import { LuBookmarkMinus } from "react-icons/lu";
import { IoAnalyticsOutline, IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { VscTools } from "react-icons/vsc";
import { FaUser, FaChalkboardTeacher, FaUserGraduate } from "react-icons/fa";

const Sidebar = () => {
  const adminData = useSelector((state) => state.admin.adminData);
  const { permissions, userType } = adminData?.data || {};

  const [isUserManagementHovered, setUserManagementHovered] = useState(false);
  const [dropdownTimeout, setDropdownTimeout] = useState(null);
  const dropdownRef = useRef(null);

  const sidebarItems = [
    { text: "Home", link: "/home", icon: <GoHomeFill size={20} />, permission: true },
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
      permission: permissions?.coursesPermission, // Assume no specific permission required
    },
    {
      text: "Test Panel",
      link: "/content/testpanel",
      icon: <TiDocumentText size={20} />,
      permission: permissions?.testPortalPermission,
    },
    { text: "Book Store", link: "/bookStore", icon: <MdStore size={20} />, permission: permissions?.bookStorePermission },
    { text: "Plans", link: "/plans", icon: <LuBookmarkMinus size={20} />, permission: permissions?.planPermission },
    {
      text: "Report and Analytic",
      link: "/orders",
      icon: <IoAnalyticsOutline size={20} />,
      permission: permissions?.reportAndAnalyticPermission,
    },
    {
      text: "Messages",
      link: "/messages",
      icon: <IoChatbubbleEllipsesOutline size={20} />,
      permission: permissions?.chatPermission, // Assume no specific permission required
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
    permission:permissions?.peoplePermission
  };

  const userSubItems = [
    {
      text: "Students",
      link: "/students",
      icon: <FaUserGraduate size={20} />,
      permission: permissions?.peoplePermission, // Assume no specific permission required
    },
    {
      text: "Teachers",
      link: "/teachers",
      icon: <FaChalkboardTeacher size={20} />,
      permission: permissions?.peoplePermission,
    },
  ];

  const handleMouseEnter = () => {
    clearTimeout(dropdownTimeout);
    setUserManagementHovered(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      if (!dropdownRef.current?.matches(":hover")) {
        setUserManagementHovered(false);
      }
    }, 200); // Delay before hiding
    setDropdownTimeout(timeout);
  };

  return (
    <div className="sidebar">
      <div className="sidebar1">
        <div className="sidebar2">
          <h6>AKJ Academy</h6>
        </div>
        <div className="sidebar5">
          {sidebarItems
            .filter((item) => userType === "ADMIN" || item.permission) // Filter based on permissions for TEACHER
            .map((item, index) => (
              <NavLink
                key={index}
                to={item.link}
                className="sidebar-link"
                activeClassName="active">
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

          <div
            className="sidebar-link"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            <div className="sidebar6">
              <span>{userManagementItem.icon}</span>
              <p>{userManagementItem.text}</p>
            </div>
          </div>
          <div
            ref={dropdownRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}>
            {isUserManagementHovered && (
              <div className="mt-0 flex flex-col right-0">
                {userSubItems
                  .filter((subItem) => userType === "ADMIN" || subItem.permission) // Filter based on permissions for TEACHER
                  .map((subItem, index) => (
                    <NavLink
                      key={index}
                      to={subItem.link}
                      className="sidebar-link"
                      activeClassName="active">
                      <div className="sidebar6">
                        <span>{subItem.icon}</span>
                        <p>{subItem.text}</p>
                      </div>
                    </NavLink>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
