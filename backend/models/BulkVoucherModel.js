import mongoose from "mongoose";

const bulkVoucherSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    fileName: {
      type: String,
      required: true,
    },
    totalVouchers: {
      type: Number,
      required: true,
    },
    processedVouchers: {
      type: Number,
      default: 0,
    },
    failedVouchers: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errors: [
      {
        row: Number,
        message: String,
      },
    ],
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const BulkVoucher = mongoose.model("BulkVoucher", bulkVoucherSchema);

export default BulkVoucher;
