import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Gift, CheckCircle, QrCode } from "lucide-react";
import loyaltyAPI from "@/api/loyalty";
import LoyaltyRewardModal from "./LoyaltyRewardModal";


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
  const [pendingRewards, setPendingRewards] = useState([]);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);

  const threshold = rules.threshold || 5;
  const currentStamps = progress.currentStamps || 0;
  const rewardText = rules.rewardText || "Free Item";
  const rewardEarnedCount = progress.rewardEarnedCount || 0;
  const totalPoints = progress.totalPoints || 0;

  const stampPercentage = (currentStamps / threshold) * 100;
  const isRewardReady = currentStamps >= threshold;

  // Fetch pending rewards on component mount and periodically refresh
  useEffect(() => {
    const fetchPendingRewards = async () => {
      try {
        const response = await loyaltyAPI.getUserProgress(userId, vendorId);
        if (response.success && response.data.progress.pendingRewards) {
          setPendingRewards(response.data.progress.pendingRewards.filter(r => !r.isRedeemed));
        }
      } catch (error) {
        console.error("Failed to fetch pending rewards:", error);
      }
    };

    fetchPendingRewards();
    
    // Refresh every 10 seconds to check for redeemed rewards
    const interval = setInterval(fetchPendingRewards, 10000);
    
    return () => clearInterval(interval);
  }, [userId, vendorId]);

  // Generate stamp array
  const stamps = Array.from({ length: threshold }, (_, index) => ({
    id: index,
    isFilled: index < currentStamps,
  }));

  return (
    <div className="w-full max-w-sm mx-auto p-6 bg-white border border-gray-100 rounded-[2rem] shadow-xl">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black tracking-tighter text-gray-900 mb-2 uppercase">
          {vendorName} Loyalty
        </h2>
        <p className="text-gray-500 font-bold text-[10px] tracking-widest uppercase">Collect stamps, earn rewards!</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
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
      <div className="mb-8">
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
      <div className="grid grid-cols-1 gap-4 mb-8">
        <div className="bg-gray-50 border border-gray-100 rounded-3xl p-5 text-center">
          <Gift className="w-5 h-5 text-black mx-auto mb-3 opacity-80" />
          <p className="text-3xl font-black tracking-tighter text-gray-900">{rewardEarnedCount}</p>
          <p className="text-[9px] font-bold tracking-widest uppercase text-gray-500 mt-1">Rewards Claimed</p>
        </div>
      </div>

      {/* Pending Rewards QR Display */}
      {pendingRewards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-2xl p-5 mb-6">
            <div className="flex items-start gap-4">
              <Gift className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black text-gray-900 uppercase tracking-wider">
                  Reward Available!
                </h3>
                <p className="text-xs text-gray-600 mt-2 font-medium">
                  Show this QR code to the vendor to claim your {pendingRewards[0].description}.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsRewardModalOpen(true)}
            className="w-full py-4 bg-black text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-gray-900 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <QrCode className="w-5 h-5" />
            {pendingRewards.length > 1 ? `Display ${pendingRewards.length} Rewards` : "Show Reward QR"}
          </button>

          <p className="text-[10px] font-medium text-gray-500 text-center mt-4 leading-relaxed">
            Present the QR code to {vendorName} staff to redeem your reward.
          </p>
        </motion.div>
      )}
      {isRewardReady && pendingRewards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6"
        >
          <div className="bg-black text-white rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <CheckCircle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-black uppercase tracking-wider">
                  Threshold Reached
                </h3>
                <p className="text-xs text-gray-300 mt-2 font-medium">
                  You've earned your reward. Scan a QR code to unlock it!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Box */}
      {!isRewardReady && pendingRewards.length === 0 && (
        <div className="bg-gray-50 border border-gray-100 text-gray-500 text-xs rounded-2xl p-4 text-center font-medium">
          <p>
            <strong className="text-black">{threshold - currentStamps}</strong> more{" "}
            {threshold - currentStamps === 1 ? "stamp" : "stamps"} until you can
            claim <strong className="text-black">{rewardText}</strong>
          </p>
        </div>
      )}

      <LoyaltyRewardModal
        isOpen={isRewardModalOpen}
        onClose={() => setIsRewardModalOpen(false)}
        pendingRewards={pendingRewards}
        userId={userId}
        vendorId={vendorId}
        vendorName={vendorName}
      />
    </div>
  );
};

export default DynamicStampCard;
