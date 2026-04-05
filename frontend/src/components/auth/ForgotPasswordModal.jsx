import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Key, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import api from "../../api/axios";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: appleEase } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: appleEase } },
};

const stepVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: appleEase } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2, ease: appleEase } },
};

const ForgotPasswordModal = ({ isOpen, onClose, onBackToLogin }) => {
  const [step, setStep] = useState("email"); // email, code, password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendResetCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/auth/forgot-password", {
        email: formData.email,
      });

      setSuccess("Reset code sent! Check your email.");
      setStep("code");
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");

    if (!formData.code) {
      setError("Please enter the reset code");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/verify-reset-code", {
        email: formData.email,
        otp: formData.code,
      });

      setSuccess("Code verified. You can now create a new password.");
      setStep("password");
    } catch (err) {
      console.error("Verify reset code error:", err);
      setError(err.response?.data?.message || "Invalid reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsLoading(false);
      return;
    }

    try {
      await api.post("/auth/reset-password", {
        email: formData.email,
        newPassword: formData.newPassword,
      });

      setSuccess("Password reset successfully!");
      setTimeout(() => {
        onClose();
        onBackToLogin();
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "code") {
      setStep("email");
      setError("");
      setSuccess("");
    } else if (step === "password") {
      setStep("code");
      setError("");
    }
  };

  const resetModal = () => {
    setStep("email");
    setError("");
    setSuccess("");
    setFormData({
      email: "",
      code: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
      >
        <motion.div
          className="bg-black text-white rounded-[2rem] p-6 md:p-10 w-full max-w-md relative border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)]"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Back Button */}
          {step !== "email" && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 text-white/70 hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">Back</span>
            </button>
          )}

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-white/10 p-3 rounded-2xl border border-white/10">
                {step === "email" && <Mail className="h-6 w-6 text-white" />}
                {step === "code" && <Key className="h-6 w-6 text-white" />}
                {step === "password" && <CheckCircle className="h-6 w-6 text-white" />}
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === "email" && "Reset Password"}
              {step === "code" && "Enter Reset Code"}
              {step === "password" && "New Password"}
            </h2>
            <p className="text-white/60 text-sm">
              {step === "email" && "Enter your email to receive a reset code"}
              {step === "code" && "Check your email for the 6-digit code"}
              {step === "password" && "Create a new secure password"}
            </p>
          </div>

          {/* Status Messages */}
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl flex items-center gap-3"
              >
                <div className="h-4 w-4 bg-white rounded-full flex-shrink-0" />
                <p className="text-white text-sm">{error}</p>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-white/10 border border-white/20 rounded-xl flex items-center gap-3"
              >
                <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
                <p className="text-white text-sm">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Step */}
          <AnimatePresence mode="wait">
            {step === "email" && (
              <motion.form
                onSubmit={handleSendResetCode}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/80">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-10 h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white focus:ring-white/20"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-white text-black font-medium rounded-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Code Step */}
          <AnimatePresence mode="wait">
            {step === "code" && (
              <motion.form
                onSubmit={handleVerifyCode}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium text-white/80">
                    Reset Code
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={formData.code}
                      onChange={handleInputChange}
                      className="pl-10 h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40 text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-white/50 text-center">
                    Code expires in 5 minutes
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-white text-black font-medium rounded-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Verifying...
                    </div>
                  ) : (
                    "Verify Code"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Password Step */}
          <AnimatePresence mode="wait">
            {step === "password" && (
              <motion.form
                onSubmit={handleResetPassword}
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-6"
              >
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-medium text-white/80">
                      New Password
                    </Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white focus:ring-white/20"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/80">
                      Confirm Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm new password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="h-11 border-white/20 bg-white/5 text-white placeholder:text-white/40 focus:border-white focus:ring-white/20"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 bg-white text-black font-medium rounded-lg transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Resetting...
                    </div>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;