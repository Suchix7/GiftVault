import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: appleEase, delay: 0.1 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: appleEase } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: appleEase } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: appleEase } },
};

const AuthForm = ({
  isLogin,
  userType,
  formData,
  setFormData,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  errors,
  isLoading,
  handleSubmit,
  handleInputChange,
  onForgotPassword,
}) => {
  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSubmit(e);
  };

  return (
    <motion.form
      onSubmit={handleFormSubmit}
      className="space-y-5"
      variants={formVariants}
    >
      {/* Name Field (Register Only) */}
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
            <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              {userType === "vendor" ? "Business Name" : "Full Name"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder={userType === "vendor" ? "Acme Corp" : "John Doe"}
              value={formData.name}
              onChange={handleInputChange}
              className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none ${errors.name ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50" : ""}`}
              required={!isLogin}
            />
            {errors.name && <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">{errors.name}</p>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vendor Category (Register Vendor Only) */}
      <AnimatePresence mode="popLayout">
        {!isLogin && userType === "vendor" && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
            className="space-y-1.5"
          >
            <Label htmlFor="vendorCategory" className="text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
              Business Category <span className="text-red-500">*</span>
            </Label>
            <select
              id="vendorCategory"
              name="vendorCategory"
              value={formData.vendorCategory}
              onChange={handleInputChange}
              className="w-full h-12 bg-[#F5F5F7] border border-transparent text-black rounded-xl px-4 focus:bg-white focus:border-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 appearance-none cursor-pointer"
              required={!isLogin && userType === "vendor"}
            >
              <option value="Cafe">☕ Cafe</option>
              <option value="Restaurant">🍽️ Restaurant</option>
              <option value="Clothing">👕 Clothing</option>
              <option value="Electronics">📱 Electronics</option>
              <option value="Beauty">💄 Beauty</option>
              <option value="Services">🔧 Services</option>
              <option value="Other">🏪 Other</option>
            </select>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Field */}
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
          value={formData.email}
          onChange={handleInputChange}
          className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none ${
            errors.email
              ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
              : ""
          }`}
          required
        />
        {errors.email && (
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
            {errors.email}
          </p>
        )}
      </motion.div>

      {/* Password Field */}
      <motion.div layout className="space-y-1.5">
        <div className="flex justify-between items-center ml-1">
          <Label
            htmlFor="password"
            className="text-[10px] font-bold uppercase tracking-widest text-gray-500"
          >
            Password <span className="text-red-500">*</span>
          </Label>
          {isLogin && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] text-gray-400 hover:text-black transition-colors uppercase tracking-widest font-bold"
            >
              Forgot?
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={formData.password}
            onChange={handleInputChange}
            className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none pr-12 ${
              errors.password
                ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                : ""
            }`}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1">
            {errors.password}
          </p>
        )}
      </motion.div>

      {/* Confirm Password Field (Register Only) */}
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
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`h-12 bg-[#F5F5F7] border-transparent text-black placeholder:text-gray-400 rounded-xl focus:bg-white focus:border-gray-200 focus:ring-4 focus:ring-gray-100 transition-all duration-300 shadow-none pr-12 ${
                  errors.confirmPassword
                    ? "border-red-300 focus:border-red-400 focus:ring-red-100 bg-red-50/50"
                    : ""
                }`}
                required={!isLogin}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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

      {/* Submit Button */}
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
    </motion.form>
  );
};

export default AuthForm;