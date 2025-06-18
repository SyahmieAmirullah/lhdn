import React, { useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button
} from 'reactstrap';
import './Menu.css';
import UserHeader from './UserHeader';
import { useNavigate, Link } from 'react-router-dom';

const Menu = () => {
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");
  const username = sessionStorage.getItem("username");

  useEffect(() => {
    if (!userId) {
      navigate("/login");
    }
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <>
      <UserHeader />

      <Container className="menu-container mt-5 pt-5">
        <h2 className="text-center mb-2 fw-bold">Main Menu</h2>

        <p className="text-center text-muted mb-4">
          Welcome, <strong>{username}</strong> (IC: {userId})
        </p>

        <Row className="justify-content-center">
          <Col md="4" className="mb-4">
            <Card className="menu-card text-center">
              <CardBody>
                <h5>Profile</h5>
                <Button color="primary" tag={Link} to="/profile">
                  Go to Profile
                </Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="4" className="mb-4">
            <Card className="menu-card text-center">
              <CardBody>
                <h5>Tax</h5>
                <Button color="success" tag={Link} to="/tax">
                  View Tax Info
                </Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="4" className="mb-4">
            <Card className="menu-card text-center">
              <CardBody>
                <h5>e-BE</h5>
                <Button color="info" tag={Link} to="/BE">
                  Fill e-BE Form
                </Button>
              </CardBody>
            </Card>
          </Col>

          <Col md="4" className="mb-4">
            <Card className="menu-card text-center">
              <CardBody>
                <h5>e-Filing</h5>
                <Button color="warning" tag={Link} to="/efiling">
                  Access e-Filing
                </Button>
              </CardBody>
            </Card>
          </Col>

          

          <Col md="4" className="mb-4">
            <Card className="menu-card text-center">
              <CardBody>
                <h5>Logout</h5>
                <Button color="danger" onClick={handleLogout}>
                  Logout
                </Button>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Menu;
