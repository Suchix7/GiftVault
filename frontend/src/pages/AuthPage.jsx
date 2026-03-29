import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import axios from "axios";
import api from "../api/axios";

import {
  Gift,
  ArrowLeft,
  Shield,
  Users,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Fingerprint,
} from "lucide-react";

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
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("user");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    setSuccessMsg("");
    if (!isLogin) setActiveTab("user");
  };

  const validateForm = (formData) => {
    const newErrors = {};
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email";

    if (!password) newErrors.password = "Password is required";
    else if (password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    if (!isLogin) {
      const name = formData.get("name");
      const confirmPassword = formData.get("confirmPassword");

      if (!name)
        newErrors.name =
          activeTab === "vendor"
            ? "Business name is required"
            : "Full name is required";

      if (!confirmPassword) newErrors.confirmPassword = "Confirm your password";
      else if (password !== confirmPassword)
        newErrors.confirmPassword = "Passwords don't match";
    }

    return newErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMsg("");

    const formData = new FormData(event.currentTarget);
    const validationErrors = validateForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }

    try {
      const email = formData.get("email");
      const password = formData.get("password");
      const role = activeTab;

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
        if (activeTab === "admin") {
          setErrors({ general: "Admin accounts cannot be registered." });
          setIsLoading(false);
          return;
        }

        const name = formData.get("name");
        const response = await api.post(
          "/auth/register",
          { name, email, password, role },
          { withCredentials: true },
        );

        const { token, ...userData } = response.data;
        localStorage.setItem("userInfo", JSON.stringify(userData));

        if (role === "vendor") {
          setSuccessMsg(
            "Vendor account submitted for approval. You'll be notified when approved.",
          );
          // Clear form visually
          event.target.reset();
        } else {
          setSuccessMsg(
            "Account created successfully! Redirecting to login...",
          );
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg("");
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
      {/* --- Pristine Ambient Background --- */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] bg-gradient-to-tr from-gray-200/40 to-slate-100/40 rounded-full blur-[100px]"
        />
      </div>

      {/* --- Top Nav / Back Button --- */}
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

      {/* --- Main Auth Container --- */}
      <motion.div
        className="w-full max-w-[420px] relative z-10 mt-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div className="text-center mb-8" variants={itemVariants}>
          <div className="flex justify-center mb-6">
            <div className="bg-white border border-gray-100 p-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <Gift className="h-6 w-6 text-black" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-black mb-2">
            {isLogin ? "Access Vault" : "Initialize"}
          </h1>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            {isLogin
              ? "Enter your credentials to continue."
              : "Create your secure identity."}
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          layout
          transition={{ duration: 0.5, ease: appleEase }}
          className="bg-white border border-gray-100/80 rounded-[2rem] p-6 md:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] backdrop-blur-xl"
        >
          {/* Smooth Sliding Tabs */}
          <motion.div layout className="mb-8">
            <div className="flex p-1 bg-[#F5F5F7] rounded-xl relative">
              {availableTabs.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`relative flex-1 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
                    activeTab === tab
                      ? "text-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {tab === "user" && <Users className="w-3.5 h-3.5" />}
                  {tab === "vendor" && <Shield className="w-3.5 h-3.5" />}
                  {tab === "admin" && <Lock className="w-3.5 h-3.5" />}
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 bg-white rounded-lg shadow-sm border border-gray-100/50 -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Status Banners */}
            <AnimatePresence mode="wait">
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.3, ease: appleEase }}
                  className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 overflow-hidden mb-4"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-600 font-medium leading-relaxed">
                    {errors.general}
                  </p>
                </motion.div>
              )}
              {successMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, scale: 0.95, height: 0 }}
                  transition={{ duration: 0.3, ease: appleEase }}
                  className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 overflow-hidden mb-4"
                >
                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-green-700 font-medium leading-relaxed">
                    {successMsg}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="space-y-1.5"
                >
                  <Label
                    htmlFor="name"
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1"
                  >
                    {activeTab === "vendor" ? "Business Name" : "Full Name"}{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={
                      activeTab === "vendor" ? "Acme Corp" : "John Doe"
                    }
                    className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none ${
                      errors.name
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                        : ""
                    }`}
                  />
                  {errors.name && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                      {errors.name}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1"
              >
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@domain.com"
                className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none ${
                  errors.email
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                    : ""
                }`}
              />
              {errors.email && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                  {errors.email}
                </p>
              )}
            </motion.div>

            <motion.div layout className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <Label
                  htmlFor="password"
                  className="text-[10px] font-bold uppercase tracking-widest text-gray-500"
                >
                  Password <span className="text-red-500">*</span>
                </Label>
                {isLogin && (
                  <a
                    href="#"
                    className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-bold"
                  >
                    Forgot?
                  </a>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none pr-12 ${
                    errors.password
                      ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                      : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                  {errors.password}
                </p>
              )}
            </motion.div>

            <AnimatePresence mode="popLayout">
              {!isLogin && (
                <motion.div
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className="space-y-1.5"
                >
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1"
                  >
                    Confirm Password <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none pr-12 ${
                        errors.confirmPassword
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                          : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="pt-6">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-black text-white hover:bg-gray-900 rounded-xl text-xs font-bold uppercase tracking-[0.1em] shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.15)] transition-all duration-300 group"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Authenticate" : "Deploy Identity"}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
            </motion.div>
          </form>

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
    </div>
  );
};

export default AuthPage;
