import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table } from "reactstrap";
import axios from "axios";
import AdminSidebar from "./AdminSideBar";
import Footer from "./Footer";

const TaxManagement = () => {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/class"); // ✅ Backend endpoint
      setClasses(response.data);
    } catch (error) {
      console.error("Error fetching class data:", error);
    }
  };

  const handleEdit = (id) => {
    console.log("Editing class", id);
    // You can redirect to edit page if needed
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/api/class/${id}`);
      setClasses(classes.filter((cls) => cls.CLASS_ID !== id));
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  };

  return (
    <>
      <AdminSidebar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">Social Class Management</h2>

        <Row>
          <Col md="12">
            <Button color="primary" href="/admin/addclass" className="mb-3">
              Add New Class
            </Button>
            <Table striped responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Class Category</th>
                  <th>Income Min (RM)</th>
                  <th>Income Max (RM)</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls, index) => (
                  <tr key={cls.CLASS_ID}>
                    <td>{index + 1}</td>
                    <td>{cls.CLASS_CAT}</td>
                    <td>{cls.INCOME_RANGE_MIN}</td>
                    <td>{cls.INCOME_RANGE_MAX}</td>
                    <td>{cls.CLASS_DESC}</td>
                    <td>
                      <Button
                        color="warning"
                        size="sm"
                        onClick={() => handleEdit(cls.CLASS_ID)}
                        className="me-2"
                      >
                        Edit
                      </Button>
                      <Button
                        color="danger"
                        size="sm"
                        onClick={() => handleDelete(cls.CLASS_ID)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default TaxManagement;
