import mongoose from "mongoose";
import crypto from "crypto";

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // Document will be automatically deleted after 5 minutes
  },
  attempts: {
    type: Number,
    default: 0,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

// Hash OTP before saving
otpSchema.pre("save", async function (next) {
  if (this.isModified("otp")) {
    const hash = crypto.createHash("sha256");
    this.otp = hash.update(this.otp).digest("hex");
  }
  next();
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function (enteredOTP) {
  const hash = crypto.createHash("sha256");
  const hashedOTP = hash.update(enteredOTP).digest("hex");
  return this.otp === hashedOTP;
};

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
