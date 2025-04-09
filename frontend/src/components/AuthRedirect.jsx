// src/components/AuthRedirect.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (userInfo) {
      switch (userInfo.role) {
        case "admin":
          navigate("/admin_dashboard");
          break;
        case "vendor":
          navigate("/vendor_dashboard");
          break;
        default:
          navigate("/customer_dashboard");
      }
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  return null;
};

export default AuthRedirect;
