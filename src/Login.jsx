import React, { useState } from "react";
import {
  Button,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Header from "./Header";
import Footer from "./Footer";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log("Login Success:", result);

      if (response.ok) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("role", result.role?.toLowerCase());

        if (result.userId) sessionStorage.setItem("userId", result.userId);
        if (result.username) sessionStorage.setItem("username", result.username);

        const role = result.role?.toLowerCase();

        if (role === "admin") {
          navigate("/adminmenu");
        } else if (role === "payer") {
          navigate("/menu");
        } else {
          setError("Unknown role. Access denied.");
        }
      } else {
        setError(result.message || "Invalid credentials.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate("/resetpassword");
  };

  return (
    <>
      <Header />
      <div className="login-page">
        <Container>
          <Row className="justify-content-center">
            <Col md="6" lg="5">
              <Card className="login-card p-4">
                <CardBody>
                  <h3 className="text-center mb-4">Login</h3>
                  {error && <Alert color="danger">{error}</Alert>}
                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="identifier">IC Number</Label>
                      <Input
                        type="text"
                        name="identifier"
                        id="identifier"
                        placeholder="Enter your IC number"
                        value={formData.identifier}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                    <FormGroup>
                      <Label for="password">Password</Label>
                      <Input
                        type="password"
                        name="password"
                        id="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                    <Button color="primary" block disabled={isSubmitting}>
                      {isSubmitting ? "Logging in..." : "Login"}
                    </Button>
                  </Form>
                  <div className="text-center mt-3">
                    <Button color="link" onClick={handleForgotPassword}>
                      Forgot Password?
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <Footer />
    </>
  );
};

export default Login;
