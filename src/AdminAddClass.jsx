import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
  Card,
} from "reactstrap";
import axios from "axios";
import AdminSideBar from "./AdminSideBar";
import Footer from "./Footer";

const AdminAddClass = () => {
  const [formData, setFormData] = useState({
    CLASS_ID: "",
    CLASS_CAT: "",
    INCOME_RANGE_MIN: "",
    INCOME_RANGE_MAX: "",
    CLASS_DESC: "",
  });

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setError("");

    try {
      const response = await axios.post("http://localhost:3000/api/class", formData);
      if (response.data.success) {
        setSuccess(true);
        setFormData({
          CLASS_ID: "",
          CLASS_CAT: "",
          INCOME_RANGE_MIN: "",
          INCOME_RANGE_MAX: "",
          CLASS_DESC: "",
        });
      } else {
        setError("Failed to add class. Try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Server error: " + err.message);
    }
  };

  return (
    <>
      <AdminSideBar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">Add New Social Class</h2>
        <Row className="justify-content-center">
          <Col md="8">
            {success && (
              <Alert color="success" isOpen={true} fade timeout={300}>
                Class added successfully!
              </Alert>
            )}
            {error && (
              <Alert color="danger" isOpen={true} fade timeout={300}>
                {error}
              </Alert>
            )}
            <Card body>
              <Form onSubmit={handleSubmit}>
                <FormGroup>
                  <Label for="CLASS_ID">Class ID</Label>
                  <Input
                    type="text"
                    name="CLASS_ID"
                    id="CLASS_ID"
                    value={formData.CLASS_ID}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="CLASS_CAT">Class Category</Label>
                  <Input
                    type="select"
                    name="CLASS_CAT"
                    id="CLASS_CAT"
                    value={formData.CLASS_CAT}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Category --</option>
                    <option value="B40">B40</option>
                    <option value="M40">M40</option>
                    <option value="T20">T20</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="INCOME_RANGE_MIN">Income Range Min (RM)</Label>
                  <Input
                    type="number"
                    name="INCOME_RANGE_MIN"
                    id="INCOME_RANGE_MIN"
                    value={formData.INCOME_RANGE_MIN}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="INCOME_RANGE_MAX">Income Range Max (RM)</Label>
                  <Input
                    type="number"
                    name="INCOME_RANGE_MAX"
                    id="INCOME_RANGE_MAX"
                    value={formData.INCOME_RANGE_MAX}
                    onChange={handleChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="CLASS_DESC">Class Description</Label>
                  <Input
                    type="textarea"
                    name="CLASS_DESC"
                    id="CLASS_DESC"
                    value={formData.CLASS_DESC}
                    onChange={handleChange}
                  />
                </FormGroup>
                <Button color="primary" type="submit">
                  Add Class
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default AdminAddClass;
