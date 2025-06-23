import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Table, Input } from "reactstrap";
import axios from "axios";
import AdminSidebar from "./AdminSideBar";
import Footer from "./Footer";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:3000/api/admin/users");
        const usersData = res.data;

        // Keep only internal status from DB
        const usersWithStatus = usersData.map((user) => ({
          ...user,
          internalStatus: user.status || "N/A",
        }));

        setUsers(usersWithStatus);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };

    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const filteredUsers = users.filter((user) => {
    const keyword = searchTerm.toLowerCase();
    return (
      user.username.toLowerCase().includes(keyword) ||
      user.email.toLowerCase().includes(keyword) ||
      user.phone.toLowerCase().includes(keyword) ||
      user.internalStatus.toLowerCase().includes(keyword)
    );
  });

  return (
    <>
      <AdminSidebar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">User Management</h2>

        <Row className="mb-3">
          <Col md="6">
            <Input
              type="text"
              placeholder="Search by username, email, phone, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Col>
          <Col md="6" className="text-md-end mt-2 mt-md-0">
            <Button color="primary" href="/register">
              Add New User
            </Button>
          </Col>
        </Row>

        <Row>
          <Col md="12">
            <Table striped>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={user.id}>
                      <td>{index + 1}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.phone}</td>
                      <td>{user.internalStatus}</td>
                      <td>
                        <Button
                          color="danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Col>
        </Row>
      </Container>

      <Footer />
    </>
  );
};

export default UserManagement;
