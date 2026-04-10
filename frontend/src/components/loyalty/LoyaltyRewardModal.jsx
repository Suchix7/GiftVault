import React, { useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const LoyaltyRewardModal = ({
  isOpen,
  onClose,
  pendingRewards = [],
  userId,
  vendorId,
  vendorName = "Merchant"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!isOpen) return null;

  const currentReward = pendingRewards[currentIndex];
  const totalRewards = pendingRewards.length;

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % totalRewards);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + totalRewards) % totalRewards);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 md:p-10 max-w-md w-full shadow-2xl relative overflow-hidden text-center max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Larger tap target for mobile */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Header */}
            <div className="mb-4 sm:mb-8 mt-2 sm:mt-0">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                <Gift className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-black tracking-tighter uppercase">
                {totalRewards > 1 ? `Reward ${currentIndex + 1}/${totalRewards}` : "Your Reward"}
              </h2>
              <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">
                Claim at {vendorName}
              </p>
            </div>

            {/* Reward Detail */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-4 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-1 leading-tight">
                {currentReward?.description || "Free Item"}
              </h3>
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3 h-3" /> Ready to Redeem
              </p>
            </div>

            {/* QR Code Section */}
            <div className="relative group mb-6 sm:mb-8 px-8">
              <div className="bg-white p-3 sm:p-4 rounded-3xl border-4 border-gray-100 shadow-sm inline-block mx-auto">
                <QRCodeCanvas
                  value={`loyalty-reward|${userId}|${vendorId}|${currentReward?.qrToken}`}
                  size={window.innerWidth < 640 ? 160 : 220} // Dynamic scaling
                  level="H"
                  className="mx-auto"
                />
              </div>

              {totalRewards > 1 && (
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                  <button
                    onClick={handlePrev}
                    className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    className="w-10 h-10 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <p className="text-[10px] font-medium text-gray-500 mb-6 sm:mb-8 max-w-[240px] mx-auto leading-relaxed">
              Present this code to staff to redeem your <span className="text-black font-bold">{currentReward?.description}</span>
            </p>

            <button
              onClick={onClose}
              className="w-full h-12 sm:h-14 bg-black text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl active:scale-95 transition-transform"
            >
              Close & Go Back
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LoyaltyRewardModal;