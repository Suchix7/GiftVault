import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import api from "../api/axios";
import { ArrowLeft, Fingerprint } from "lucide-react";

// Import modular components
import {
  AuthHeader,
  AuthTabs,
  AuthForm,
  AuthStatusMessages,
  AuthBackground,
  ForgotPasswordModal
} from "../components/auth";

// Set axios base URL
axios.defaults.baseURL = "http://localhost:5555/api";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const containerVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: appleEase, staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: appleEase } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: appleEase } },
};

const AuthPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [userType, setUserType] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    vendorCategory: "Other",
  });

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccess("");
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      vendorCategory: "Other",
    });
    if (!isLogin) setUserType("user");
  };

  const validateForm = (data) => {
    const newErrors = {};

    if (!data.email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      newErrors.email = "Please enter a valid email";

    if (!data.password) newErrors.password = "Password is required";
    else if (data.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!isLogin) {
      if (!data.name)
        newErrors.name =
          userType === "vendor"
            ? "Business name is required"
            : "Full name is required";

      if (!data.confirmPassword) newErrors.confirmPassword = "Confirm your password";
      else if (data.password !== data.confirmPassword)
        newErrors.confirmPassword = "Passwords don't match";
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccess("");

    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const { email, password, name } = formData;
      const role = userType;

      if (isLogin) {
        // --- LOGIN LOGIC ---
        const response = await api.post(
          "/auth/login",
          { email, password },
          { withCredentials: true },
        );

        // Store user info in localStorage (excluding sensitive token if handled by cookies)
        const { token, ...userData } = response.data;
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...userData,
            role: response.data.role, // Ensure role is stored
          }),
        );

        // Redirect based on backend role
        const redirectPath =
          response.data.role === "admin"
            ? "/admin_dashboard"
            : response.data.role === "vendor"
              ? "/vendor_dashboard"
              : "/customer_dashboard";

        navigate(redirectPath);
      } else {
        // --- REGISTER LOGIC ---
        if (userType === "admin") {
          setErrors({ general: "Admin accounts cannot be registered." });
          setIsLoading(false);
          return;
        }

        const response = await api.post(
          "/auth/register",
          { name, email, password, role, vendorCategory: formData.vendorCategory },
          { withCredentials: true },
        );

        const { token, ...userData } = response.data;
        localStorage.setItem("userInfo", JSON.stringify(userData));

        if (role === "vendor") {
          setSuccess(
            "Vendor account submitted for approval. You'll be notified when approved.",
          );
          // Clear form visually
          setFormData({
            name: "",
            email: "",
            phone: "",
            password: "",
            confirmPassword: "",
            vendorCategory: "Other",
          });
        } else {
          setSuccess(
            "Account created successfully! Redirecting to login...",
          );
          setTimeout(() => {
            setIsLogin(true);
            setSuccess("");
          }, 2000);
        }
      }
    } catch (err) {
      console.error("Auth error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        "Authentication failed. Please try again.";
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Dynamic tabs based on auth mode
  const availableTabs = isLogin
    ? ["user", "vendor", "admin"]
    : ["user", "vendor"];

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-[#1D1D1F] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-black selection:text-white">
      {/* Ambient Background */}
      <AuthBackground />

      {/* Top Nav / Back Button */}
      <div className="absolute top-0 left-0 w-full p-6 md:p-8 z-20 flex justify-between items-center">
        <Link
          to="/landingpage"
          className="group flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Return
        </Link>
        <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
          <Fingerprint className="w-3 h-3 text-black/30" /> Secure Protocol
        </div>
      </div>

      {/* Main Auth Container */}
      <motion.div
        className="w-full max-w-[420px] relative z-10 mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <AuthHeader isLogin={isLogin} />

        {/* Form Card */}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: appleEase }}
          className="bg-white border border-gray-100/80 rounded-[2rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] backdrop-blur-xl"
        >
          {/* Tabs */}
          <motion.div layout className="mb-8">
            <AuthTabs userType={userType} setUserType={setUserType} availableTabs={availableTabs} />
          </motion.div>

          {/* Status Messages */}
          <AuthStatusMessages error={errors.general} success={success} />

          {/* Form */}
          <AuthForm
            isLogin={isLogin}
            userType={userType}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            errors={errors}
            isLoading={isLoading}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            onForgotPassword={() => setShowForgotPassword(true)}
          />

          {/* Footer */}
          <motion.div
            layout
            className="mt-8 pt-6 border-t border-gray-100 text-center"
          >
            <button
              type="button"
              onClick={toggleAuthMode}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-black transition-colors"
            >
              {isLogin
                ? "New to GiftVault? Create Account"
                : "Already verified? Sign in"}
            </button>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        onBackToLogin={() => {
          setShowForgotPassword(false);
          setIsLogin(true);
          setErrors({});
          setSuccess("");
        }}
      />
    </div>
  );
};

export default AuthPage;
