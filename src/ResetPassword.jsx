import React, { useState } from "react";
import axios from "axios";
import {
  Container,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from "reactstrap";
import { useNavigate } from "react-router-dom"; // ✅ import navigation hook

const ResetPassword = () => {
  const [userId, setUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // ✅ initialize navigation

  const handleReset = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("http://localhost:3000/api/reset-password", {
        identifier: userId,
        newPassword: newPassword,
      });

      setMessage(res.data.message);
      setError("");

      // ✅ Delay before redirecting to login page
      setTimeout(() => {
        navigate("/login"); // navigate to login page
      }, 2000); // 2-second delay to show success message

    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
      setMessage("");
    }
  };

  return (
    <Container className="mt-5 pt-5" style={{ maxWidth: "500px" }}>
      <h2 className="text-center mb-4">Reset Password</h2>
      <Form onSubmit={handleReset}>
        <FormGroup>
          <Label for="userId">User ID (IC Number)</Label>
          <Input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </FormGroup>
        <FormGroup>
          <Label for="newPassword">New Password</Label>
          <Input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </FormGroup>
        <Button color="primary" block>
          Reset Password
        </Button>
      </Form>

      {message && <Alert color="success" className="mt-3">{message}</Alert>}
      {error && <Alert color="danger" className="mt-3">{error}</Alert>}
    </Container>
  );
};

export default ResetPassword;
