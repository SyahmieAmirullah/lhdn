import React from "react";
import "./Header.css";
import {
  Navbar,
  NavbarBrand,
  Container,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Nav
} from "reactstrap";
import { FaUserPlus } from "react-icons/fa";

const Header = () => {
  return (
    <header>
      <Navbar color="primary" dark expand="md" className="py-2">
        <Container>
          <NavbarBrand href="/">MyLHDN</NavbarBrand>
          <Nav className="ms-auto" navbar>
            <UncontrolledDropdown nav inNavbar>
              <DropdownToggle nav caret>
                Account
              </DropdownToggle>
              <DropdownMenu end>
                <DropdownItem href="/register">
                  <FaUserPlus className="me-2" />
                  Register
                </DropdownItem>
              </DropdownMenu>
            </UncontrolledDropdown>
          </Nav>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
