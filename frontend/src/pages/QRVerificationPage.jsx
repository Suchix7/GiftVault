import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, Gift, Loader, Zap } from "lucide-react";
import api from "@/api/axios";
import loyaltyAPI from "../api/loyalty";
import { toast } from "sonner";
import { QRCodeCanvas } from "qrcode.react";

/**
 * QR Verification Page
 * Customers land here after scanning a QR code or clicking a verification link
 * URL: /verify?token=UUID
 */
const QRVerificationPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [showRewardOverlay, setShowRewardOverlay] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    const verifyQR = async () => {
      try {
        setLoading(true);

        // Fetch current user
        const userRes = await api.get("/users/profile");
        const userId = userRes.data.user._id;
        setCurrentUser(userRes.data.user);

        if (!userId) {
          setError("User not found. Please log in.");
          setLoading(false);
          return;
        }

        if (!token) {
          setError("No QR token provided");
          setLoading(false);
          return;
        }

        // Verify the QR token
        const response = await loyaltyAPI.verifyQRToken(token, userId);

        if (response.success) {
          setResult(response.data);
          if (response.data.rewardEarned) {
            setShowRewardOverlay(true);
          }
          toast.success("Reward validation successful");
        } else {
          setError(response.message || "Failed to verify QR code");
          toast.error(response.message || "Failed to verify QR code");
        }
      } catch (err) {
        const errorMsg =
          err.response?.data?.message ||
          "Failed to verify QR code. Please try again.";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    verifyQR();
  }, [token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="text-black"
        >
          <Loader className="w-10 h-10" />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-10 max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-red-500" />
          </motion.div>
          
          <h1 className="text-3xl font-black text-black mb-3 tracking-tighter uppercase">
            Invalid Token
          </h1>
          <p className="text-gray-500 font-medium mb-8 text-sm">{error}</p>
          
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        className="bg-white border border-gray-100 rounded-[2.5rem] shadow-sm p-8 md:p-10 max-w-md w-full relative overflow-hidden"
      >
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none" />

        {/* Success Header */}
        <div className="text-center mb-10 relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
            className="w-20 h-20 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/10 rotate-3"
          >
            <Zap className="w-10 h-10" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-black text-black mb-2 tracking-tighter uppercase"
          >
            Verified
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-gray-500 font-medium text-sm"
          >
            Point metrics have been synchronized.
          </motion.p>
        </div>

        {/* Points Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4 mb-10 relative z-10"
        >
          <div className="flex gap-4">
            {/* Added Points */}
            <div className="flex-1 bg-[#F5F5F7] rounded-[2rem] p-6 text-center shadow-inner border border-gray-100/50">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Granted</p>
              <p className="text-4xl font-black text-black">
                +{result?.pointsEarned || 0}
              </p>
            </div>

            {/* Total Balance */}
            <div className="flex-1 bg-black text-white rounded-[2rem] p-6 text-center shadow-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">Balance</p>
              <p className="text-4xl font-black">
                {result?.totalPoints || 0}
              </p>
            </div>
          </div>

          {/* Stamps Progress Bar */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Stamp Progress</p>
              <span className="text-xs font-black text-black tracking-widest">
                {result?.currentStamps || 0} / {result?.threshold || 0}
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    ((result?.currentStamps || 0) / (result?.threshold || 1)) *
                    100
                  }%`,
                }}
                transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                className="h-full bg-black rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Dynamic Reward Alert */}
        <AnimatePresence>
          {result?.rewardEarned && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ delay: 0.8 }}
              className="bg-black text-white rounded-2xl p-5 mb-8 flex items-start gap-4 shadow-xl relative z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
              <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
                <Gift className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider mb-1">
                  Threshold Reached
                </h3>
                <p className="text-xs text-gray-300 font-medium">
                  {result?.rewardText || "A new reward"} is now available in your vault.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-3 relative z-10"
        >
          <button
            onClick={() => navigate("/customer_dashboard")}
            className="w-full py-4 px-6 bg-black text-white text-xs font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-800 transition-all hover:-translate-y-0.5"
          >
            Access Vault
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-4 px-6 bg-[#F5F5F7] text-gray-500 hover:text-black text-xs font-bold uppercase tracking-[0.2em] rounded-2xl transition-all"
          >
            Return
          </button>
        </motion.div>

      </motion.div>

      {/* Reward Unlocked Overlay */}
      <AnimatePresence>
        {showRewardOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
          >
            {/* Animated Background Confetti */}
            {[...Array(24)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  rotate: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 1200, 
                  y: (Math.random() - 0.5) * 1200, 
                  rotate: Math.random() * 720,
                  opacity: 0
                }}
                transition={{ 
                  duration: 3, 
                  ease: "easeOut",
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
                className="absolute w-2 h-2 rounded-full bg-white/20 pointer-events-none"
              />
            ))}

            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="bg-white rounded-[3rem] p-10 max-w-sm w-full shadow-[0_0_80px_rgba(255,255,255,0.1)] relative text-center"
            >
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-black text-white rounded-3xl flex items-center justify-center shadow-2xl rotate-12">
                <Gift className="w-12 h-12" />
              </div>

              <div className="mt-8 mb-8">
                <h2 className="text-4xl font-black text-black mb-2 tracking-tighter uppercase leading-none">
                  Asset<br/>Unlocked
                </h2>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-4">
                  Merchant Verification Ready
                </p>
              </div>

              <div className="bg-white p-6 rounded-[2.5rem] border-4 border-gray-50 shadow-inner mb-8 inline-block relative group">
                <QRCodeCanvas 
                  value={result?.pendingRewardToken 
                    ? `loyalty-reward|${currentUser?._id}|${result?.vendorId}|${result.pendingRewardToken}`
                    : `loyalty-reward|${currentUser?._id}|${result?.vendorId}`
                  }
                  size={220}
                  level="H"
                  className="mx-auto"
                />
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2rem] flex items-center justify-center">
                  <Zap className="text-black w-8 h-8 animate-pulse" />
                </div>
              </div>

              <p className="text-[11px] font-medium text-gray-500 mb-10 leading-relaxed uppercase tracking-tight">
                Your reward is now pending redemption. Visit your dashboard to view and claim your <strong className="text-black">{result?.rewardText || "Reward"}</strong> by showing this QR to the vendor.
              </p>

              <button
                onClick={() => setShowRewardOverlay(false)}
                className="w-full py-4 bg-black text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-800 transition-all active:scale-95"
              >
                Dismiss & Finish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QRVerificationPage;
