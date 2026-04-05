import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Gift, CheckCircle, Zap, X, QrCode } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

/**
 * DynamicStampCard Component
 * Displays a customer's loyalty stamps and reward progress for a vendor
 * Features:
 * - Dynamic grid based on vendor's threshold
 * - Animated stamp fill
 * - Reward claim modal
 * - Progress visualization
 */
const DynamicStampCard = ({
  vendorId,
  userId,
  vendorName = "Merchant",
  onClaimReward,
  progress = {},
  rules = {},
}) => {
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);

  const threshold = rules.threshold || 5;
  const currentStamps = progress.currentStamps || 0;
  const rewardText = rules.rewardText || "Free Item";
  const rewardEarnedCount = progress.rewardEarnedCount || 0;
  const totalPoints = progress.totalPoints || 0;

  const stampPercentage = (currentStamps / threshold) * 100;
  const isRewardReady = currentStamps >= threshold;

  // Generate stamp array
  const stamps = Array.from({ length: threshold }, (_, index) => ({
    id: index,
    isFilled: index < currentStamps,
  }));

  const handleClaimReward = async () => {
    setIsClaimingReward(true); // Now used to open the QR modal
  };

  const handleCloseClaimModal = async () => {
    setIsClaimingReward(false);
    
    // Refresh the progress
    if (onClaimReward) {
      await onClaimReward();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border border-gray-100 rounded-[2rem] shadow-xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-2xl font-black tracking-tighter text-gray-900 mb-2 uppercase">
          {vendorName} Loyalty
        </h2>
        <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">Collect stamps, earn rewards!</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <span className="text-[10px] font-black tracking-widest uppercase text-gray-500">
            Progress
          </span>
          <span className="text-xs font-black tracking-widest uppercase text-gray-900">
            {currentStamps}/{threshold}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
          <motion.div
            className="h-full bg-black rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${stampPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Stamp Grid */}
      <div className="mb-10">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(threshold, 5)}, 1fr)` }}>
          {stamps.map((stamp, index) => (
            <motion.div
              key={stamp.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: stamp.isFilled ? index * 0.1 : 0,
                duration: 0.4,
              }}
              className="relative"
            >
              <div
                className={`
                  w-full aspect-square rounded-2xl flex items-center justify-center font-black text-lg
                  transition-all duration-300 cursor-default
                  ${
                    stamp.isFilled
                      ? "bg-black text-white shadow-lg shadow-black/10"
                      : "bg-gray-50 border-2 border-gray-100 text-gray-400"
                  }
                `}
              >
                {stamp.isFilled ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </motion.div>
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-10">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 text-center">
          <Gift className="w-5 h-5 text-black mx-auto mb-3 opacity-80" />
          <p className="text-3xl font-black tracking-tighter text-gray-900">{rewardEarnedCount}</p>
          <p className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mt-1">Rewards Claimed</p>
        </div>
      </div>

      {/* Reward Ready Message & Button */}
      {isRewardReady && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="bg-gray-50 border-l-4 border-black rounded-r-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-black flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-wider">
                  {rewardText} Unlocked!
                </h3>
                <p className="text-xs text-gray-500 mt-2 font-medium">
                  You've earned your reward. Claim it now!
                </p>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleClaimReward}
            disabled={isClaimingReward}
            className={`
              w-full h-14 rounded-full text-xs font-black uppercase tracking-[0.2em]
              transition-all duration-300 flex items-center justify-center gap-3 shadow-lg
              ${
                isClaimingReward
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-900 active:scale-95 shadow-black/5"
              }
            `}
          >
            <Gift className="w-4 h-4" />
            {isClaimingReward ? "Generating QR..." : "Generate Claim QR"}
          </motion.button>
        </motion.div>
      )}

      {/* QR Code Modal Overlay */}
      {isClaimingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl relative text-center"
          >
            <button
              onClick={handleCloseClaimModal}
              className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-6">
              <QrCode className="w-8 h-8 text-black" />
            </div>
            
            <h3 className="text-2xl font-black text-gray-900 mb-2">Claim Reward</h3>
            <p className="text-sm font-medium text-gray-500 mb-8">
              Show this QR code to the vendor staff to claim your <strong className="text-black">{rewardText}</strong>.
            </p>
            
            <div className="bg-white p-4 rounded-2xl border-4 border-gray-100 shadow-sm inline-block mb-8">
              <QRCodeCanvas 
                value={`loyalty-reward|${userId}|${vendorId}`}
                size={220}
                level="Q"
                className="mx-auto"
              />
            </div>
            
            <button
              onClick={handleCloseClaimModal}
              className="w-full bg-black text-white font-bold py-4 rounded-xl hover:bg-gray-900 transition-colors"
            >
              Close & Refresh Status
            </button>
          </motion.div>
        </div>
      )}

      {/* Claimed Confirmation */}
      {rewardClaimed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-50 border border-gray-100 rounded-3xl p-6 text-center shadow-lg"
        >
          <CheckCircle className="w-8 h-8 text-black mx-auto mb-3" />
          <p className="text-gray-900 font-black uppercase tracking-widest text-lg">Reward Claimed!</p>
          <p className="text-xs text-gray-500 mt-2 font-medium">
            Your stamps have been reset. Keep collecting!
          </p>
        </motion.div>
      )}

      {/* Info Box */}
      {!isRewardReady && (
        <div className="bg-gray-50 border border-gray-100 text-gray-500 text-xs rounded-2xl p-4 text-center font-medium">
          <p>
            <strong className="text-black">{threshold - currentStamps}</strong> more{" "}
            {threshold - currentStamps === 1 ? "stamp" : "stamps"} until you can
            claim <strong className="text-black">{rewardText}</strong>
          </p>
        </div>
      )}
    </div>
  );
};

export default DynamicStampCard;
