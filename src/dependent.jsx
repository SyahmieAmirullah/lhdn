import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "./UserSideBar";

const Dependent = () => {
  const [userId, setUserId] = useState(null);
  const [zakatStatus, setZakatStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Always sync userId from sessionStorage
  useEffect(() => {
    const storedUserId = sessionStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      alert("User not logged in. Please login first.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      try {
        const zakatRes = await axios.post(
          "http://20.189.113.46:3000/api/lhdn/check-recipient-status",
          { nric: userId }
        );

        if (zakatRes.data) {
          setZakatStatus(zakatRes.data.isZakatRecipient);
        }
      } catch (err) {
        console.error("Error fetching zakat status:", err);
        alert("Failed to fetch zakat status. Please check console.");
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  return (
    <>
      <Sidebar />
      <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
            Zakat Recipient Status
          </h1>

          <div className="mb-6 text-center">
            <p className="text-gray-700 text-lg">
              <span className="font-semibold">User ID (NRIC):</span>{" "}
              {userId || "Not logged in"}
            </p>
          </div>

          <div className="mt-6 text-center">
            {loading ? (
              <p className="text-gray-500 animate-pulse">
                Checking zakat status...
              </p>
            ) : zakatStatus === true ? (
              <p className="text-green-600 font-semibold text-lg bg-green-50 p-3 rounded-lg shadow-sm">
                ✅ Applicant is a confirmed Zakat recipient.
              </p>
            ) : zakatStatus === false ? (
              <p className="text-red-600 font-semibold text-lg bg-red-50 p-3 rounded-lg shadow-sm">
                ❌ Applicant is not a Zakat recipient.
              </p>
            ) : (
              <p className="text-gray-500">No zakat status available.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dependent;
