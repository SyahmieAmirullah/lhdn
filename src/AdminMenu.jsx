import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";
import axios from "axios";
import AdminSidebar from "./AdminSideBar";
import Footer from "./Footer";

const AdminMenu = () => {
  const [userCount, setUserCount] = useState(0);
  const [totalTax, setTotalTax] = useState(0); // Placeholder
  const [totalTransactions, setTotalTransactions] = useState(0); // Placeholder

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usersRes = await axios.get("http://localhost:3000/api/admin/total-users");
        const taxRes = await axios.get("http://localhost:3000/api/admin/total-tax");
        const transactionRes = await axios.get("http://localhost:3000/api/admin/total-transactions");
        setUserCount(usersRes.data.totalUsers);
        setTotalTax(taxRes.data.totalTax);
        setTotalTransactions(transactionRes.data.totalTransactions);
      } catch (error) {
        console.error("Failed to load admin dashboard data", error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <AdminSidebar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">Admin Dashboard</h2>
        <Row>
          <Col md="4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Total Users</CardTitle>
                <CardText>{userCount} registered users</CardText>
              </CardBody>
            </Card>
          </Col>

          <Col md="4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Total Collected Tax</CardTitle>
                <CardText>RM {totalTax}</CardText>
              </CardBody>
            </Card>
          </Col>

          <Col md="4">
            <Card>
              <CardBody>
                <CardTitle tag="h5">Total Transactions</CardTitle>
                <CardText>{totalTransactions} transactions</CardText>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  );
};

export default AdminMenu;
