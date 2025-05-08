import React, { useState } from "react";
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

const Navbar = ({ toggleSidebar }) => {
  const [show, setShow] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Handlers for hover state
  const handleDropdownMouseEnter = () => setDropdownOpen(true);
  const handleDropdownMouseLeave = () => setDropdownOpen(false);

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
              onMouseLeave={handleDropdownMouseLeave}>
              <Dropdown.Toggle
                className=" flex"
                as="div"
                id="dropdown-custom-components">
                <div className="navbar6">
                  <img className=" mr-3" src={img} alt="Profile" />
                </div>
                <div className="navbar7">
                  <p className=" ml-5">Adeola Ayo</p>
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
