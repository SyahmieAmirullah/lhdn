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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        alert("User registered successfully!");

        setFormData({
          user_id: "",
          username: "",
          user_password: "",
          user_email: "",
          user_phone: "",
        });

        // Redirect after 2 seconds
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

      {message && <p className="text-center mt-3">{message}</p>}

      <Footer />
    </>
  );
};

export default Register;
