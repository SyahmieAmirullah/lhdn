import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import { Spinner } from 'react-bootstrap'; // Import a spinner for loading state
import Sidebar from './UserSideBar';
const Payment = () => {
  const [payment, setPayment] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Hook to manage navigation

  // 🔐 Get user session info
  const userId = sessionStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError('User ID is missing from session.');
      return;
    }

    axios.get(`http://localhost:3000/payment/${userId}`)
      .then(res => setPayment(res.data))
      .catch(err => {
        console.error(err);
        setError('Failed to load payment data.');
      });
  }, [userId]);

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!payment) return <div className="d-flex justify-content-center"><Spinner animation="border" variant="primary" /></div>;

  // Function to handle navigation to the insert payment page if the status is 'Not Paid'
  const handlePayNow = () => {
    navigate(`/insertpayment/${userId}`); // Navigate to /insert-payment with userId as part of the route
  };

  return (
    <>
    <Sidebar />
    <div className="container p-4">
      <h2 className="text-center mb-4">Payment Information</h2>

      <div className="card shadow-sm p-3">
        <div className="mb-3">
          <p><strong>Full Name:</strong> {payment.FULL_NAME}</p>
        </div>
        <div className="mb-3">
          <p><strong>User ID:</strong> {payment.USER_ID || 'N/A'}</p>
        </div>
        <div className="mb-3">
          <p><strong>Tax Due:</strong> RM {payment.TAX_DUE || '0.00'}</p>
        </div>
        <div className="mb-3">
          <p><strong>Payment Status:</strong> {payment.PAYMENT_STATUS || 'Not Paid'}</p>
        </div>

        {/* Conditionally render the 'Pay Now' button if payment status is 'Not Paid' or null */}
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
