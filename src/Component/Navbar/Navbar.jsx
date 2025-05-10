import React, { useEffect, useState } from "react";
import "./Navbar.css";
import Offcanvas from "react-bootstrap/Offcanvas";
import Dropdown from "react-bootstrap/Dropdown";
import { useNavigate } from "react-router-dom";
import { FaRegBell } from "react-icons/fa6";
import { BsFilterRight } from "react-icons/bs";
import { IoSearchOutline } from "react-icons/io5";
import { IoIosArrowDown } from "react-icons/io";
import { GiPlainCircle } from "react-icons/gi";
import { LiaSignOutAltSolid } from "react-icons/lia";

// import img from '../../Image/img.png'
import img from "../../Image/img3.png";
import Notifications from "../../Pages/Notifications/Notifications";
import api from "../../api/axios";

const Navbar = ({ toggleSidebar }) => {
  const [show, setShow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Handlers for hover state
  const handleDropdownMouseEnter = () => setDropdownOpen(true);
  const handleDropdownMouseLeave = () => setDropdownOpen(false);

  const [profile, setProfile] = useState({
    firstName: "",
    profilePicture: null,
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get("/admin/getProfile");
        console.log("getProfile response is here :", res);
        const data = res.data?.data || {}; // adjust based on actual API structure
        setProfile({
          firstName: data.firstName || "",
          profilePicture: data.image || null,
        });
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, []);

  return (
    <>
      <div className="navbar11">
        <div className="navbar1">
          <div className="navbar2"></div>
          <div className="navbar4">
            <div className="navbar8" onClick={handleShow}>
              <div className="navbar9">
                <FaRegBell color="#1A85FF" size={24} />
              </div>
              <div className="navbar10">
                <GiPlainCircle color="#EE0000" size={15} />
              </div>
            </div>

            {/* Profile dropdown (opens on hover) */}
            <Dropdown
              className="navbar5"
              show={dropdownOpen} // Control dropdown visibility manually
              onMouseEnter={handleDropdownMouseEnter}
              onMouseLeave={handleDropdownMouseLeave}
            >
              <Dropdown.Toggle
                className=" flex"
                as="div"
                id="dropdown-custom-components"
              >
                {profile.profilePicture ? (
                  <div className="flex items-center mr-4">
                    <img
                      src={profile.profilePicture}
                      className="w-12 h-12 rounded-full object-cover border shadow"
                    />
                  </div>
                ) : (
                  <div className="navbar6">
                    <img className=" mr-3" src={img} alt="Profile" />
                  </div>
                )}

                <div className="navbar7">
                  <p className=" ml-5">{profile.firstName || "User"}</p>
                  <IoIosArrowDown color="#D0CECE" />
                </div>
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item href="/settings">Settings</Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/")}>
                  Sign Out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Notifications Offcanvas */}
      <Offcanvas show={show} onHide={handleClose} placement="end">
        <Notifications handleClose={handleClose} />
      </Offcanvas>
    </>
  );
};

export default Navbar;
