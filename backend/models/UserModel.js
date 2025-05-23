import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    number: {
      type: String,
      required: false,
    },
    companyName: {
      type: String,
    },
    role: {
      type: String,
      enum: ["customer", "vendor", "admin"],
      default: "customer",
    },
    redeemedVouchers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voucher",
      },
    ],
    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "customer" || this.role === "admin"; // Auto-approve customers and admins
      },
    },
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    bonusPoints: {
      type: Number,
      default: 0,
    },
    smsOtpEnabled: {
      type: Boolean,
      default: false,
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    lastOtpSent: {
      type: Date,
    },
    otpAttempts: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// MODIFIED: Generate referral code before saving
userSchema.pre("save", function (next) {
  if (this.isNew && !this.referralCode) {
    // Generate a unique 8-character referral code
    this.referralCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
  }
  next();
});

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// MODIFIED: Add method to handle bonus points
userSchema.methods.addBonusPoints = async function (points) {
  this.bonusPoints += points;
  await this.save();
  return this.bonusPoints;
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
