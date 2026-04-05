import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const messageVariants = {
  hidden: { opacity: 0, y: -10, height: 0 },
  visible: { opacity: 1, y: 0, height: "auto", transition: { duration: 0.3, ease: appleEase } },
  exit: { opacity: 0, scale: 0.95, height: 0, transition: { duration: 0.3, ease: appleEase } },
};

const AuthStatusMessages = ({ error, success }) => {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.div
          className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 overflow-hidden mb-4"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-600 font-medium leading-relaxed">
            {error}
          </p>
        </motion.div>
      )}

      {success && (
        <motion.div
          className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3 overflow-hidden mb-4"
          variants={messageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
          <p className="text-xs text-green-700 font-medium leading-relaxed">
            {success}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AuthStatusMessages;