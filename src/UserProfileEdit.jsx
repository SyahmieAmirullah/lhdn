import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardBody, Col, Form, FormGroup, Label, Input, Button, Row
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from './UserSideBar'; // Ensure this file exists

const UserProfileEdit = () => {
  const [profileData, setProfileData] = useState({
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

      // Send a PUT request to update only the address, occupation, and income bracket
      await axios.put(`http://localhost:3000/api/profile/${userId}`, {
        user_addr: profileData.user_addr,
        user_occupation: profileData.user_occupation,
        income_bracket: profileData.income_bracket,
      });

      alert('Profile updated successfully!');
      navigate('/profile');
    } catch (err) {
      console.error("Update error:", err);
      setError('Error updating profile.');
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
            <h3 className="mb-4 text-center">Edit User Profile</h3>
            <Form onSubmit={(e) => e.preventDefault()}>
              {/* Address field */}
              <FormGroup>
                <Label htmlFor="user_addr">Address/Alamat</Label>
                <Input
                  type="text"
                  id="user_addr"
                  name="user_addr"
                  value={profileData.user_addr || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              {/* Occupation field */}
              <FormGroup>
                <Label htmlFor="user_occupation">Occupation/Pekerjaan</Label>
                <Input
                  type="text"
                  id="user_occupation"
                  name="user_occupation"
                  value={profileData.user_occupation || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              {/* Income Bracket field */}
              <FormGroup>
                <Label htmlFor="income_bracket">Income/Pendapatan</Label>
                <Input
                  type="text"
                  id="income_bracket"
                  name="income_bracket"
                  value={profileData.income_bracket || ''}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              {/* Error Message */}
              {error && <p className="text-danger">{error}</p>}

              {/* Save Button */}
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

export default UserProfileEdit;
