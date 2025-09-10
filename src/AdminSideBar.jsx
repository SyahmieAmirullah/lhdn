import React, { useState } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import {
  FaUserCircle,
  FaChartLine,
  FaSignOutAlt,
  FaUsers,
  FaMoneyBillAlt,
} from "react-icons/fa";
import "./SideBar.css";
import { BsFileBarGraph } from "react-icons/bs";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "Close" : "Open"}
      </div>

      <div
        className={`sidebar bg-dark text-white p-3 ${
          isOpen ? "open" : "closed"
        }`}
      >
        <h4 className="text-white mb-4">Admin Panel</h4>
        <Nav vertical>
          <NavItem>
            <NavLink href="/adminmenu" className="text-white">
              <FaChartLine /> Dashboard
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/admin/users" className="text-white">
              <FaUsers /> User Management
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="/admin/tax" className="text-white">
              <FaMoneyBillAlt /> Tax Management
            </NavLink>
          </NavItem>
          <NavItem>
          <NavLink 
             href="https://app.powerbi.com/groups/me/reports/06a7585a-1ad3-4131-b7e3-bf5e414e401d/785f66824577b585cb81?experience=power-bi" 
             target="_blank" 
              rel="noopener noreferrer"
              className="text-white"
          >
          <BsFileBarGraph /> Report & Analytics
          </NavLink>
          </NavItem>

          <NavItem>
            <NavLink href="/logout" className="text-white">
              <FaSignOutAlt /> Logout
            </NavLink>
          </NavItem>
        </Nav>
      </div>
    </>
  );
};

export default AdminSidebar;
