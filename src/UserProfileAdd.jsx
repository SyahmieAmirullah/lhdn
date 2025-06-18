import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardBody, Col, Form, FormGroup, Label, Input, Button, Row
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from './UserSideBar'; // Ensure this file exists

const UserProfileAdd = () => {
  const [profileData, setProfileData] = useState({
    full_name: '',
    user_addr: '',
    user_occupation: '',
    income_bracket: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (userId) {
      const fetchProfileData = async () => {
        try {
          const response = await axios.get(`http://localhost:3000/api/profile/${userId}`);
          setProfileData({
            full_name: response.data.full_name || '',
            user_addr: response.data.user_addr || '',
            user_occupation: response.data.user_occupation || '',
            income_bracket: response.data.income_bracket || '',
          });
        } catch (err) {
          setError('Failed to fetch profile data');
        }
      };

      fetchProfileData();
    }
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!userId) {
      setError('User ID is missing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post(`http://localhost:3000/api/profile/${userId}`, {
        user_id: userId,
        full_name: profileData.full_name,
        user_addr: profileData.user_addr,
        user_occupation: profileData.user_occupation,
        income_bracket: profileData.income_bracket,
      });

      alert('Profile saved successfully!');
      navigate('/profile');
    } catch (err) {
      console.error("Save error:", err);
      setError('Error saving profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row className="m-4">
      {/* Sidebar column */}
      <Col md="3">
        <Sidebar />
      </Col>

      {/* Form column */}
      <Col md="9">
        <Card>
          <CardBody>
            <h3 className="mb-4 text-center">ADD USER PROFILE</h3>
            <Form onSubmit={(e) => e.preventDefault()}>
              {[
                { label: "Full Name/Nama Penuh", name: "full_name" },
                { label: "Address/Alamat", name: "user_addr" },
                { label: "Occupation/Pekerjaan", name: "user_occupation" },
                { label: "Income/Pendapatan", name: "income_bracket" },
              ].map((field) => (
                <FormGroup key={field.name}>
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    type="text"
                    id={field.name}
                    name={field.name}
                    value={profileData[field.name] || ''}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
              ))}

              {error && <p className="text-danger">{error}</p>}
              <Button
                color="primary"
                onClick={handleSave}
                disabled={loading}
                className="mt-3"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </Form>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
};

export default UserProfileAdd;
