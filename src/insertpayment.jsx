import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const InsertPayment = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [submitId, setSubmitId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // New state for fetched payment data
  const [paymentInfo, setPaymentInfo] = useState(null);

  useEffect(() => {
    // Fetch submit ID and tax due
    const fetchPaymentInfo = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/payment/${userId}`);
        const data = response.data;
        setPaymentInfo(data);
        if (data && data.SUBMIT_ID) {
          setSubmitId(data.SUBMIT_ID); // pre-fill submit ID in form
        }
      } catch (err) {
        console.error('Error fetching payment info:', err);
      }
    };

    fetchPaymentInfo();
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!submitId || !paymentAmount || !transactionRef) {
      setError('All fields are required.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/payment/insert', {
        submit_id: submitId,
        payment_amount: paymentAmount,
        transaction_ref: transactionRef,
      });

      setMessage(`✅ ${response.data.message} - Status: ${response.data.payment_status}`);
      setError('');

      setTimeout(() => navigate('/payment'), 2000);
    } catch (err) {
      console.error(err);
      setError('❌ Failed to insert payment. Please try again.');
      setMessage('');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Insert Payment</h2>

      {/* Display fetched payment info */}
      {paymentInfo && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p><strong>Full Name:</strong> {paymentInfo.FULL_NAME}</p>
          <p><strong>Submit ID:</strong> {paymentInfo.SUBMIT_ID}</p>
          <p><strong>Tax Due (RM):</strong> {paymentInfo.TAX_DUE}</p>
          <p><strong>Payment Status:</strong> {paymentInfo.PAYMENT_STATUS || 'Not Paid'}</p>
        </div>
      )}

      {error && <p className="text-red-600">{error}</p>}
      {message && <p className="text-green-600">{message}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Submit ID:</label>
          <input
            type="text"
            value={submitId}
            onChange={(e) => setSubmitId(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Payment Amount (RM):</label>
          <input
            type="number"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Transaction Reference:</label>
          <input
            type="text"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit Payment
        </button>
      </form>
    </div>
  );
};

export default InsertPayment;
