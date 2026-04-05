import React from "react";
import { motion } from "framer-motion";
import { User, Store, Shield } from "lucide-react";

// --- Signature Apple-Style Easing ---
const appleEase = [0.32, 0.72, 0, 1];

const tabVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: appleEase } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: appleEase } },
};

const AuthTabs = ({ userType, setUserType, availableTabs }) => {
  const tabs = [
    { id: "user", label: "Customer", icon: User },
    { id: "vendor", label: "Vendor", icon: Store },
    { id: "admin", label: "Admin", icon: Shield },
  ].filter(tab => availableTabs.includes(tab.id));

  return (
    <motion.div
      className="flex p-1 bg-[#F5F5F7] rounded-xl relative"
      variants={tabVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => setUserType(tab.id)}
            className={`relative flex-1 py-2.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest z-10 transition-colors duration-300 flex items-center justify-center gap-2 ${
              userType === tab.id
                ? "text-black"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {tab.label}
            {userType === tab.id && (
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
        );
      })}
    </motion.div>
  );
};

export default AuthTabs;