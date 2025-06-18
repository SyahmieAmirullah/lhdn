import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRouteAdmin = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const role = decoded.role?.toLowerCase();

    if (role !== "admin") {
      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    console.error("Token decode error:", error);
    return <Navigate to="/login" replace />;
  }
};

export default ProtectedRouteAdmin;
