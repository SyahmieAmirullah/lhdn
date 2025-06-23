import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card, CardBody, Col, Form, FormGroup, Label, Input, Button, Row
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import Sidebar from './UserSideBar';

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
    if (!userId) return;

    const fetchData = async () => {
      try {
        // ✅ Fetch full name and address from external API
        const userInfoRes = await axios.post('https://myjpn.ddns.net:5443/LHDNApi/profile', {
          icno: userId
        });

        const userInfo = userInfoRes.data?.user;

        if (!userInfo?.fullname || !userInfo?.address) {
          setError("User info incomplete. Cannot proceed.");
          return;
        }

        // ✅ Fetch occupation and income from your backend
        const profileRes = await axios.get(`http://localhost:3000/api/profile/${userId}`);

        setProfileData({
          full_name: userInfo.fullname,
          user_addr: userInfo.address,
          user_occupation: profileRes.data.user_occupation || '',
          income_bracket: profileRes.data.income_bracket || '',
        });

      } catch (err) {
        console.error("Fetch error:", err);
        setError('Failed to fetch user or profile data.');
      }
    };

    fetchData();
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

    if (!profileData.full_name || !profileData.user_addr) {
      setError('Full name and address must be available before saving.');
      return;
    }

    if (!profileData.user_occupation || !profileData.income_bracket) {
      setError('Occupation and income are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await axios.post(`http://localhost:3000/api/profile/${userId}`, {
        user_id: userId,
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
      <Col md="3">
        <Sidebar />
      </Col>

      <Col md="9">
        <Card>
          <CardBody>
            <h3 className="mb-4 text-center">ADD USER PROFILE</h3>
            <Form onSubmit={(e) => e.preventDefault()}>
              <FormGroup>
                <Label htmlFor="full_name">Full Name / Nama Penuh</Label>
                <Input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profileData.full_name}
                  readOnly
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="user_addr">Address / Alamat</Label>
                <Input
                  type="text"
                  id="user_addr"
                  name="user_addr"
                  value={profileData.user_addr}
                  readOnly
                  disabled
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="user_occupation">Occupation / Pekerjaan</Label>
                <Input
                  type="text"
                  id="user_occupation"
                  name="user_occupation"
                  value={profileData.user_occupation}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="income_bracket">Income / Pendapatan</Label>
                <Input
                  type="text"
                  id="income_bracket"
                  name="income_bracket"
                  value={profileData.income_bracket}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              {error && <p className="text-danger">{error}</p>}
              <Button
                color="primary"
                onClick={handleSave}
                disabled={loading || !profileData.full_name || !profileData.user_addr}
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
