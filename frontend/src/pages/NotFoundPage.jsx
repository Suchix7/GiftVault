"use client";
import { Link, useNavigate } from "react-router-dom";
import { Gift, ArrowLeft, AlertTriangle } from "lucide-react";
import { Button } from "../components/ui/button";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Back button */}
      <div className="p-4">
        <Link to="/">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>

      {/* 404 Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Gift className="h-6 w-6" />
            <span className="text-2xl font-bold">GiftVault</span>
          </div>
        </div>

        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-24 w-24 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
          <p className="text-gray-400 mb-8">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/landingpage">Go to Home</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
