import mongoose from "mongoose";

const userProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    currentStamps: {
      type: Number,
      default: 0,
      description: "Current stamps towards next reward (0 to threshold)",
    },
    totalPoints: {
      type: Number,
      default: 0,
      description: "Total points accumulated from all scans",
    },
    rewardEarnedCount: {
      type: Number,
      default: 0,
      description: "Number of rewards claimed by this user at this vendor",
    },
    lastScannedAt: {
      type: Date,
      default: null,
      description: "Timestamp of last successful QR scan",
    },
    claimedRewards: [
      {
        claimedAt: Date,
        stampsAtClaim: Number,
        description: String,
      },
    ],
    pendingRewards: [
      {
        earnedAt: Date,
        stampsAtEarn: Number,
        description: String,
        qrToken: String, // Unique token for this pending reward
        isRedeemed: { type: Boolean, default: false },
        redeemedAt: Date,
        redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Vendor who redeemed
      },
    ],
  },
  { timestamps: true }
);

// Compound index for efficient lookups
userProgressSchema.index({ userId: 1, vendorId: 1 }, { unique: true });
userProgressSchema.index({ vendorId: 1 });

export default mongoose.model("UserProgress", userProgressSchema);
