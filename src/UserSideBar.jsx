import React, { useState } from "react";
import {
  Nav,
  NavItem,
  NavLink,
  Collapse,
} from "reactstrap";
import {
  FaUserCircle,
  FaFileInvoiceDollar,
  FaFileSignature,
  FaBars,
  FaTimes,
  FaThLarge,
  FaChevronDown,
  FaChevronUp,
  FaSignOutAlt,
  FaMoneyCheckAlt, // Payment icon
} from "react-icons/fa";
import { Link } from "react-router-dom";
import "./SideBar.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [efilingOpen, setEfilingOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const toggleEfiling = () => setEfilingOpen(!efilingOpen);

  const handleLogout = () => {
    localStorage.removeItem("token"); // Clear auth token
    window.location.href = "/login";  // Redirect to login page
  };

  return (
    <>
      {/* Toggle Button: shows hamburger if closed, X if open */}
      <div className="sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Sidebar content */}
      <div className={`sidebar bg-dark text-white p-3 ${isOpen ? "open" : "closed"}`}>
        <h4 className="text-white mb-4">MyLHDN</h4>
        <Nav vertical>
          <NavItem>
            <NavLink tag={Link} to="/menu" className="text-white d-flex align-items-center gap-2">
              <FaThLarge /> Menu
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink tag={Link} to="/profile" className="text-white d-flex align-items-center gap-2">
              <FaUserCircle /> Profile
            </NavLink>
          </NavItem>

          <NavItem>
            <NavLink tag={Link} to="/tax" className="text-white d-flex align-items-center gap-2">
              <FaFileInvoiceDollar /> Tax Info
            </NavLink>
          </NavItem>

          {/* Payment Section */}
          <NavItem>
            <NavLink tag={Link} to="/payment" className="text-white d-flex align-items-center gap-2">
              <FaMoneyCheckAlt /> Payment
            </NavLink>
          </NavItem>

          {/* e-Filing Section with Collapse */}
          <NavItem>
            <div
              className="text-white d-flex align-items-center gap-2"
              style={{ cursor: "pointer" }}
              onClick={toggleEfiling}
            >
              <FaFileSignature />
              e-Filing
              {efilingOpen ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            <Collapse isOpen={efilingOpen}>
              <Nav className="ps-4" vertical>
                <NavItem>
                  <NavLink tag={Link} to="/BE" className="text-white">
                    e-BE
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/efiling" className="text-white">
                    e-Filing
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
          </NavItem>

          {/* Logout Button */}
          <NavItem className="mt-4">
            <div
              onClick={handleLogout}
              className="text-white d-flex align-items-center gap-2"
              style={{ cursor: "pointer" }}
            >
              <FaSignOutAlt /> Logout
            </div>
          </NavItem>
        </Nav>
      </div>
    </>
  );
};

export default Sidebar;
