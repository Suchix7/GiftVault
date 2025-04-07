// src/pages/Forbidden.jsx
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Forbidden = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl font-bold">403 - Forbidden</h1>
      <p>You don't have permission to access this page</p>
      <Button onClick={() => navigate("/auth")}>Go to Login</Button>
    </div>
  );
};

export default Forbidden;
