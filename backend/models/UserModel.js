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
      enum: ["user", "vendor", "admin"],
      default: "user",
    },

    isApproved: {
      type: Boolean,
      default: function () {
        return this.role === "user" || this.role === "admin"; // Auto-approve users and admins
      },
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

// Method to compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.models.User || mongoose.model("User", userSchema);
