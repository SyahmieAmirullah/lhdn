import React, { useState, useEffect } from "react";
import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  Button,
  Spinner,
  Alert
} from "reactstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";
import UserSideBar from "./UserSideBar";

const UserProfile = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const getUserFromSession = () => {
    const userId = sessionStorage.getItem("userId");
    const username = sessionStorage.getItem("username");
    if (!userId) return null;
    return { userId, username };
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = getUserFromSession();
        if (!user) throw new Error("No session found");

        // Fetch internal profile (occupation, income, etc.)
        const localResponse = await axios.get(
          `http://localhost:3000/api/profile/${user.userId}`
        );
        const localData = localResponse.data;

        // Format date from IC number
        if (localData.user_id && localData.user_id.length >= 6) {
          const ic = localData.user_id.replace(/-/g, "");
          const year = parseInt(ic.slice(0, 2), 10);
          const month = ic.slice(2, 4);
          const day = ic.slice(4, 6);
          const fullYear = year < 25 ? 2000 + year : 1900 + year;
          localData.dateOfBirth = `${day}-${month}-${fullYear}`;
        }

        // Fetch full name, address, status from your own API
        const userInfoResponse = await axios.get(
          `http://localhost:3001/api/user-info/${user.userId}`
        );

        const externalData = userInfoResponse.data;

        const mergedData = {
          ...localData,
          fullname: externalData.fullname || "N/A",
          address: externalData.address || "N/A",
          payerStatus: externalData.status || "N/A"
        };

        setFormData(mergedData);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error", err);
        setError(err.message || "Failed to fetch user profile.");
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert color="danger">{error}</Alert>
        <Button color="primary" onClick={() => navigate("/login")}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <>
      <UserSideBar />
      <Container className="mt-5 pt-5">
        <h2 className="text-center mb-4">User Profile</h2>
        <Row className="justify-content-center">
          <Col md="8">
            <Card>
              <CardBody>
                {[
                  { label: "User ID/No.KP", name: "user_id" },
                  { label: "Full Name/Nama Penuh", name: "fullname" },
                  { label: "Email", name: "email" },
                  { label: "Phone", name: "phone" },
                  { label: "Payer Status/Status Pembayar", name: "payerStatus" },
                  { label: "Address/Alamat", name: "address" },
                  { label: "Date of Birth/Tarikh Lahir", name: "dateOfBirth" },
                  { label: "Occupation/Pekerjaan", name: "occupation" },
                  { label: "Income/Pendapatan", name: "incomeBracket" },
                  { label: "Social Class", name: "socialClass" }
                ].map((field) => (
                  <Row className="mb-2" key={field.name}>
                    <Col md="4">
                      <strong>{field.label}:</strong>
                    </Col>
                    <Col md="8">{formData[field.name] || "N/A"}</Col>
                  </Row>
                ))}

                <div className="d-flex justify-content-between mt-4">
                  <Button
                    color="primary"
                    onClick={() => navigate("/profile/add")}
                  >
                    Add Profile
                  </Button>

                  <Button
                    color="success"
                    onClick={() => navigate("/dependent")}
                  >
                    Dependent & Zakat Info
                  </Button>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default UserProfile;
