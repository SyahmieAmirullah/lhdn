import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import Sidebar from './UserSideBar';

const Payment = () => {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing from session.');
      return;
    }

    const fetchPaymentAndProfile = async () => {
      try {
        // Fetch payment info from your backend
        const paymentRes = await axios.get(`http://localhost:3000/payment/${userId}`);

        // Fetch user profile info from your own API
        const profileRes = await axios.get(`http://localhost:3001/api/user-info/${userId}`);
        const userData = profileRes.data;

        // Combine both results
        const combinedData = {
          ...paymentRes.data,
          FULL_NAME: userData.fullname || 'Unknown',
          ADDRESS: userData.address || 'N/A',
          STATUS: userData.status || 'N/A',
        };

        setPayment(combinedData);
      } catch (err) {
        console.error(err);
        setError('❌ Failed to load payment or profile data.');
      }
    };

    fetchPaymentAndProfile();
  }, [userId]);

  const handlePayNow = () => {
    navigate(`/insertpayment/${userId}`);
  };

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!payment) return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" variant="primary" />
    </div>
  );

  return (
    <>
      <Sidebar />
      <div className="container p-4">
        <h2 className="text-center mb-4">💰 Payment Information</h2>

        <div className="card shadow-sm p-4">
          <div className="mb-3">
            <p><strong>👤 Full Name:</strong> {payment.FULL_NAME}</p>
          </div>
          <div className="mb-3">
            <p><strong>🪪 User ID (IC):</strong> {payment.USER_ID || userId}</p>
          </div>
          <div className="mb-3">
            <p><strong>🏠 Address:</strong> {payment.ADDRESS}</p>
          </div>
          <div className="mb-3">
            <p><strong>🧾 Tax Due:</strong> RM {payment.TAX_DUE || '0.00'}</p>
          </div>
          <div className="mb-3">
            <p><strong>📌 Payment Status:</strong> {payment.PAYMENT_STATUS || 'Not Paid'}</p>
          </div>
          <div className="mb-3">
            <p><strong>🟢 Status:</strong> {payment.STATUS}</p>
          </div>

          {(payment.PAYMENT_STATUS === null || payment.PAYMENT_STATUS === 'Not Paid') && (
            <div className="text-center">
              <button onClick={handlePayNow} className="btn btn-success btn-lg">
                Pay Now
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Payment;
