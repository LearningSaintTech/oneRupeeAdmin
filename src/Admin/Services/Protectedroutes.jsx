import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const location = useLocation();
  const token = localStorage.getItem("authToken"); // ✅ Only authToken

  // If token exists, allow access
  if (token) {
    return <Outlet />;
  }

  // If no token, redirect to login
  return <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectedRoutes;
