import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema(
  {
    voucherId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Voucher",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    eventType: {
      type: String,
      enum: ["view", "sent", "redeemed", "expired"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: new Map(),
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    // Create compound index for efficient querying
    indexes: [
      { vendorId: 1, eventType: 1 },
      { voucherId: 1, eventType: 1 },
      { timestamp: -1 },
    ],
  }
);

// Add TTL index for data retention (90 days)
analyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 7776000 });

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
