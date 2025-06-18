import React from "react";
import { Container } from "reactstrap";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="app-footer">
      <Container className="text-center">
        <p>
          © {new Date().getFullYear()} LHDN Tax Filing System. All rights
          reserved.
        </p>
      </Container>
    </footer>
  );
};

export default Footer;
