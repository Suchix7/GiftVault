import express from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/UserModel.js";
import OTP from "../models/OtpModel.js";
import { JWT_SECRET } from "../config.js";
import { protect } from "../middleware/authMiddleware.js";
import { sendPasswordResetEmail } from "../utils/emailService.js";
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "30d" });
};

// In your authRoute.js
router.get("/check-session", protect, (req, res) => {
  res.json({
    user: req.user,
    role: req.user.role,
    isApproved: req.user.isApproved,
  });
});
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userExists = await User.findOne({ email });

    if (userExists) return res.status(400).json({ message: "User exists" });

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
    });
    if (!user) return res.status(400).json({ message: "Invalid data" });

    const token = generateToken(user._id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .status(201)
      .json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.role === "vendor" && !user.isApproved) {
      return res.status(403).json({ message: "Pending approval" });
    }

    const token = generateToken(user._id);
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      })
      .json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.post("/logout", (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .sendStatus(200);
});

// Forgot password endpoint
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: "If the email exists, a reset link has been sent" });
    }

    // Generate reset token (OTP)
    const resetToken = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in database
    await OTP.create({
      userId: user._id,
      email: user.email,
      otp: resetToken,
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ message: "If the email exists, a reset link has been sent" });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Failed to process request" });
  }
});

// Verify reset code endpoint
router.post("/verify-reset-code", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and reset code are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    const otpDoc = await OTP.findOne({
      userId: user._id,
      email: user.email,
      verified: false,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    const isValidOTP = await otpDoc.verifyOTP(otp);
    if (!isValidOTP) {
      otpDoc.attempts += 1;
      await otpDoc.save();

      if (otpDoc.attempts >= 3) {
        await OTP.deleteMany({ userId: user._id, email: user.email, verified: false });
        return res.status(400).json({ message: "Too many failed attempts. Request a new reset code." });
      }

      return res.status(400).json({ message: "Invalid reset code" });
    }

    otpDoc.verified = true;
    await otpDoc.save();

    return res.json({ message: "Reset code verified" });
  } catch (error) {
    console.error("Verify reset code error:", error);
    res.status(500).json({ message: "Failed to verify reset code" });
  }
});

// Reset password endpoint
router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ message: "Email and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid reset request" });
    }

    // Find a verified OTP document
    const otpDoc = await OTP.findOne({
      userId: user._id,
      email: user.email,
      verified: true,
    }).sort({ createdAt: -1 });

    if (!otpDoc) {
      return res.status(400).json({ message: "Reset code not verified. Please verify the code first." });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Clean up verified and unverified OTPs for this user
    await OTP.deleteMany({ userId: user._id, email: user.email });

    res.json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
});

export default router;
