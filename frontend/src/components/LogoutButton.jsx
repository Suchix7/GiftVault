// src/components/LogoutButton.jsx
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const LogoutButton = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout", {}, { withCredentials: true });
      localStorage.removeItem("userInfo");
      navigate("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      className="justify-start rounded-none h-12 px-4 w-full"
      onClick={handleLogout}
    >
      <LogOut className="h-5 w-5 mr-2" />
      Logout
    </Button>
  );
};

export default LogoutButton;
