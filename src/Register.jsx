import React, { useState } from "react";
import "./Register.css";
import Footer from "./Footer";

const Register = () => {
  const [formData, setFormData] = useState({
    user_id: "",
    username: "",
    user_password: "",
    user_email: "",
    user_phone: "",
  });

  const [message, setMessage] = useState("");
  const [userInfo, setUserInfo] = useState({
    fullname: "",
    address: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Reset userInfo when IC number is changed
    if (name === "user_id") {
      setUserInfo({ fullname: "", address: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Check IC number using correct key "icno"
      const checkResponse = await fetch('https://myjpn.ddns.net:5443/LHDNApi/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ icno: formData.user_id }),
      });

      const checkData = await checkResponse.json();

      if (
        !checkResponse.ok ||
        !checkData.success ||
        !checkData.user ||
        !checkData.user.fullname ||
        !checkData.user.address
      ) {
        setMessage("User not found. Please contact admin or verify your IC number.");
        return;
      }

      // Set user info for display
      setUserInfo({
        fullname: checkData.user.fullname,
        address: checkData.user.address
      });

      // Step 2: Proceed with registration
      const registerResponse = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await registerResponse.json();

      if (registerResponse.ok) {
        alert("User registered successfully!");
        setFormData({
          user_id: "",
          username: "",
          user_password: "",
          user_email: "",
          user_phone: "",
        });
        setUserInfo({ fullname: "", address: "" });

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else {
        setMessage(result.message || "Registration failed.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. Please try again later.");
    }
  };

  return (
    <>
      <h2
        style={{
          textAlign: "center",
          marginTop: "50px",
          marginBottom: "20px",
          fontWeight: "bold",
        }}
      >
        LHDN USER REGISTRATION
      </h2>

      <form className="register-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="user_id">KAD PENGENALAN</label>
          <input
            type="text"
            id="user_id"
            name="user_id"
            value={formData.user_id}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter your IC number"
          />
        </div>

        {/* Show fullname if available */}
        {userInfo.fullname && (
          <div className="form-group">
            <label>Full Name (from MyJPN)</label>
            <input
              type="text"
              className="form-control"
              value={userInfo.fullname}
              readOnly
              disabled
            />
          </div>
        )}

        {/* Show address if available */}
        {userInfo.address && (
          <div className="form-group">
            <label>Address (from MyJPN)</label>
            <textarea
              className="form-control"
              value={userInfo.address}
              rows="2"
              readOnly
              disabled
            ></textarea>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="username">USERNAME</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter your username"
          />
        </div>

        <div className="form-group">
          <label htmlFor="user_password">PASSWORD</label>
          <input
            type="password"
            id="user_password"
            name="user_password"
            value={formData.user_password}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter your password"
          />
        </div>

        <div className="form-group">
          <label htmlFor="user_email">E-MAIL</label>
          <input
            type="email"
            id="user_email"
            name="user_email"
            value={formData.user_email}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="user_phone">NO. TELEFON</label>
          <input
            type="tel"
            id="user_phone"
            name="user_phone"
            value={formData.user_phone}
            onChange={handleInputChange}
            required
            className="form-control"
            placeholder="Enter your phone number"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Register
        </button>
      </form>

      {message && <p className="text-center mt-3 text-danger">{message}</p>}

      <Footer />
    </>
  );
};

export default Register;
