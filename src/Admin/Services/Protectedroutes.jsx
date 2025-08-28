import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

const ProtectedRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      try {
        // Replace with your actual API call to verify token
        const response = await fetch(`${API_BASE_URL}/admin/verify`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("adminToken");
        }
      } catch (error) {
        setIsAuthenticated(false);
        localStorage.removeItem("adminToken");
      }
    };

    checkAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to="/admin/login" replace state={{ from: location }} />
  );
};

export default ProtectedRoutes;