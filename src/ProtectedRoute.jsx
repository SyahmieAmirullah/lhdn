import React from "react";
import { Navigate } from "react-router-dom";

// You can replace this with your real auth check (e.g., check token validity)
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
