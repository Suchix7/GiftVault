import React from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: appleEase } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.3, ease: appleEase } },
};

const AuthHeader = ({ isLogin }) => {
  return (
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
  );
};

export default AuthHeader;