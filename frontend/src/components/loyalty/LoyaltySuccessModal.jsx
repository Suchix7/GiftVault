import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Gift, Zap, X, ShieldCheck } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * LoyaltySuccessModal
 * Shows after a successful point/stamp verify scan from the dashboard
 * Features:
 * - Animated point counters
 * - Stamp progress visualization
 * - High-impact reward overlay with redemption QR
 */
const LoyaltySuccessModal = ({ isOpen, onClose, result, userId }) => {
  if (!result) return null;

  const {
    pointsEarned = 0,
    totalPoints = 0,
    currentStamps = 0,
    threshold = 0,
    rewardEarned = false,
    rewardText = "Free Item",
    vendorId,
    vendorName = "Merchant",
  } = result;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, rotateX: -10 }}
            animate={{ scale: 1, y: 0, rotateX: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="bg-white rounded-[2.5rem] p-8 md:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Reward Unlocked Overlay (High impact) */}
            {rewardEarned && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 z-50 bg-black text-white p-8 flex flex-col items-center justify-center text-center"
              >
                {/* Confetti Particles */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1 }}
                    animate={{ 
                      x: (Math.random() - 0.5) * 600, 
                      y: (Math.random() - 0.5) * 600, 
                      opacity: 0,
                      rotate: 360
                    }}
                    transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                  />
                ))}

                <motion.div
                  initial={{ y: -20 }}
                  animate={{ y: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-white text-black rounded-3xl flex items-center justify-center mb-6 shadow-2xl"
                >
                  <Gift className="w-10 h-10" />
                </motion.div>

                <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">
                  Reward<br/>Unlocked
                </h2>
                
                <div className="bg-white p-4 rounded-3xl border-4 border-white/20 shadow-xl mb-6">
                  <QRCodeCanvas 
                    value={`loyalty-reward|${userId}|${vendorId}`}
                    size={200}
                    level="H"
                    className="mx-auto"
                  />
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-8 max-w-[200px]">
                  Show this to staff to redeem your <strong className="text-white">{rewardText}</strong>
                </p>

                <button
                  onClick={onClose}
                  className="w-full h-14 bg-white text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-all border border-gray-200"
                >
                  Close & Refresh
                </button>
              </motion.div>
            )}

            {/* Standard Point Grant Success */}
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 250, delay: 0.1 }}
                className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl"
              >
                <Zap className="w-8 h-8" />
              </motion.div>

              <h2 className="text-2xl font-black text-black mb-2 tracking-tighter uppercase">Points Sync</h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-8">Verified with {vendorName}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Received</p>
                  <p className="text-2xl font-black text-black">+{pointsEarned}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">New Balance</p>
                  <p className="text-2xl font-black text-black">{totalPoints}</p>
                </div>
              </div>

              {/* Stamp Bar Overlay */}
              <div className="bg-[#F5F5F7] rounded-3xl p-5 mb-8 border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Stamp Progress</p>
                  <span className="text-xs font-black text-black">{currentStamps} / {threshold}</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(currentStamps / threshold) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.1)]"
                  />
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full h-14 bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:bg-gray-950 transition-all active:scale-95"
              >
                Vault Sync Complete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoyaltySuccessModal;
