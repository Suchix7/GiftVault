import React from "react";
import { motion } from "framer-motion";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const backgroundVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 1.2, ease: appleEase } },
};

const AuthBackground = () => {
  return (
    <motion.div
      className="fixed inset-0 -z-10 overflow-hidden"
      variants={backgroundVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Ambient gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-pink-100 to-orange-100 rounded-full blur-3xl opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-100 to-blue-100 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }} />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.03)_1px,transparent_0)] bg-[length:20px_20px]" />
    </motion.div>
  );
};

export default AuthBackground;