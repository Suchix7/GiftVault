import mongoose from "mongoose";

const loyaltyRuleSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    threshold: {
      type: Number,
      required: true,
      default: 5,
      description: "Number of stamps/scans needed to earn a reward",
    },
    pointsPerScan: {
      type: Number,
      required: true,
      default: 1,
      description: "Points or stamps awarded per successful QR scan",
    },
    rewardText: {
      type: String,
      required: true,
      default: "Free Item",
      description: "Description of the reward offered",
    },
    isActive: {
      type: Boolean,
      default: true,
      description: "Whether the loyalty program is active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("LoyaltyRule", loyaltyRuleSchema);
