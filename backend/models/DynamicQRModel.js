import mongoose from "mongoose";

const dynamicQRSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      description: "UUID token for the QR code",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    points: {
      type: Number,
      required: true,
      default: 1,
      description: "Points/stamps awarded when this QR is scanned",
    },
    isUsed: {
      type: Boolean,
      default: false,
      index: true,
      description: "Whether this QR has already been redeemed",
    },
    usedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      description: "User who redeemed this QR",
    },
    usedAt: {
      type: Date,
      default: null,
      description: "Timestamp when this QR was redeemed",
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      description: "Expiration time for the QR code (typically 2 minutes from creation)",
      index: true,
    },
  },
  { timestamps: false }
);

// Create a TTL index to automatically delete expired QR codes after 24 hours
dynamicQRSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("DynamicQR", dynamicQRSchema);
