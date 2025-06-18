import React, { useEffect, useState } from "react";
import {
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  Container,
} from "reactstrap";
import "./UserHeader.css";

const UserHeader = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    // Retrieve username from sessionStorage when component mounts
    const storedUsername = sessionStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  return (
    <Navbar
      color="primary"
      dark
      expand="md"
      fixed="top"
      className="user-header"
    >
      <Container>
        <NavbarBrand href="/">LHDN System</NavbarBrand>
        <Nav className="ml-auto" navbar>
          <NavItem className="username-text">
            <span className="nav-link text-white">Welcome, {username}</span>
          </NavItem>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default UserHeader;