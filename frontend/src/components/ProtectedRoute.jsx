// src/components/ProtectedRoute.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Forbidden from "@/pages/Forbidden";

const ProtectedRoute = ({ children, requiredRole }) => {
  const navigate = useNavigate();
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("[ProtectedRoute] Checking auth session...");
        const response = await api.get("/auth/check-session");
        console.log("[ProtectedRoute] Session check response:", response.data);

        const userRole = response.data.role;
        console.log(
          `[ProtectedRoute] User role: ${userRole}, Required role: ${requiredRole}`
        );

        if (requiredRole && userRole !== requiredRole) {
          console.log("[ProtectedRoute] Role mismatch - access denied");
          setAccessDenied(true);
          return;
        }

        console.log("[ProtectedRoute] Access granted");
      } catch (error) {
        console.error(error.response?.data || error.message);
        navigate("/auth");
      }
    };

    checkAuth();
  }, [navigate, requiredRole]);

  if (accessDenied) {
    console.log("[ProtectedRoute] Rendering Forbidden page");
    return <Forbidden />;
  }

  console.log("[ProtectedRoute] Rendering protected content");
  return children;
};

export default ProtectedRoute;
