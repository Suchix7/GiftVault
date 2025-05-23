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
    value: {
      type: Number,
      required: true,
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
      enum: ["active", "expired", "draft", "redeemed"],
      default: "draft",
    },
    color: {
      type: String,
      default: "#000000",
    },
    logo: {
      type: String, // URL or base64 encoded image
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    maxRedemptions: {
      type: Number,
      default: 1, // Default to single use
    },
    sentCount: {
      type: Number,
      default: 0,
    },
    redeemedCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Generate voucher ID before saving
voucherSchema.pre("save", function (next) {
  if (!this.isNew) return next();

  // Generate V-XXXX ID
  this.id = `V-${Math.floor(1000 + Math.random() * 9000)}`;
  next();
});

const Voucher = mongoose.model("Voucher", voucherSchema);

export default Voucher;
