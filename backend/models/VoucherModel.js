import mongoose from "mongoose";

const voucherSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "Other",
    },
    type: {
      type: String,
      enum: ["amount", "percentage"],
      default: "amount",
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    pointsRequired: {
      type: Number,
      default: 0,
    },
    maxDiscount: {
      type: Number, // optional, used only for percentage type
    },
    description: {
      type: String,
      default: "",
    },
    campaign: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "expired", "draft"],
      default: "draft",
    },
    color: {
      type: String,
      default: "#000000",
    },
    logo: {
      type: String,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    maxRedemptions: {
      type: Number,
      default: -1, // -1 means unlimited
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    redeemedCount: {
      type: Number,
      default: 0,
    },
    // Encryption fields
    encryptedCode: {
      type: String,
      required: true,
    },
    publicKey: {
      type: Object,
      required: true,
    },
    // Temporary field for storing private key during redemption
    encryptedPrivateKey: {
      type: {
        iv: { type: String, required: true },
        data: { type: String, required: true },
      },
      required: true,
      select: false, // 👈 Apply select:false to the parent
    },

    // Track redemptions per user
    redemptions: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        redeemedAt: {
          type: Date,
          default: Date.now,
        },
        code: {
          type: String,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Instance method to check if voucher can generate more codes
voucherSchema.methods.canGenerateCode = function () {
  return (
    this.status === "active" &&
    (this.maxRedemptions === -1 || this.redeemedCount < this.maxRedemptions) &&
    new Date(this.expiryDate) > new Date()
  );
};

// Check if a user has redeemed this voucher
voucherSchema.methods.isRedeemedByUser = function (userId) {
  return this.redemptions.some(
    (r) => r.userId.toString() === userId.toString()
  );
};

// Add a redemption for a user
voucherSchema.methods.addRedemption = function (userId, code) {
  if (!this.isRedeemedByUser(userId)) {
    this.redemptions.push({ userId, code });
    this.redeemedCount += 1;
  }
};

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
