import OTP from "../models/OtpModel.js";
import { User } from "../models/UserModel.js";
import nodemailer from "nodemailer";

// Debug email configuration
console.log("[Email] Configuration check:");
console.log("[Email] EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("[Email] EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);

// Create email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    console.log("[Email] Attempting to verify email configuration...");
    await transporter.verify();
    console.log("[Email] Configuration verified successfully");
    return true;
  } catch (error) {
    console.error("[Email] Configuration error:", error);
    return false;
  }
};

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for voucher redemption
export const sendRedemptionOTP = async (req, res) => {
  try {
    console.log("[OTP] Request received:", req.user);
    const userId = req.user._id;
    console.log("[OTP] User ID:", userId);

    // Check email configuration
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.error("[Email] Missing email configuration");
      return res.status(500).json({
        success: false,
        message: "Email service not configured. Please contact support.",
      });
    }

    // Verify email configuration
    const isEmailConfigured = await verifyEmailConfig();
    if (!isEmailConfigured) {
      return res.status(500).json({
        success: false,
        message: "Email service not available. Please contact support.",
      });
    }

    const user = await User.findById(userId);
    console.log("[OTP] Found user:", user ? "yes" : "no");

    if (!user) {
      console.log("[OTP] User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.email) {
      console.log("[OTP] No email found for user");
      return res.status(400).json({
        success: false,
        message: "Email not found. Please update your profile.",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    console.log("[OTP] Generated OTP");

    // Save OTP to database
    await OTP.create({
      userId: user._id,
      email: user.email,
      otp: otp,
    });
    console.log("[OTP] Saved OTP to database");

    // Create email content with a nice template
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; text-align: center;">GiftVault Voucher Redemption</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p style="font-size: 16px;">Hello ${user.name},</p>
          <p style="font-size: 16px;">Your verification code for voucher redemption is:</p>
          <div style="background-color: #ffffff; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; letter-spacing: 5px; margin: 0;">${otp}</h1>
          </div>
          <p style="font-size: 14px; color: #6b7280;">This code will expire in 5 minutes.</p>
          <p style="font-size: 14px; color: #6b7280;">If you didn't request this code, please ignore this email.</p>
        </div>
        <p style="text-align: center; color: #6b7280; font-size: 12px; margin-top: 20px;">
          © ${new Date().getFullYear()} GiftVault. All rights reserved.
        </p>
      </div>
    `;

    try {
      // Send OTP via email
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: "GiftVault - Voucher Redemption Code",
        html: emailContent,
      });
      console.log("[OTP] Email sent successfully");

      res.json({
        success: true,
        message: "OTP sent successfully to your email",
      });
    } catch (emailError) {
      console.error("[OTP] Email sending failed:", emailError);
      // Delete the OTP from database since email failed
      await OTP.deleteOne({ userId: user._id, otp: otp });
      throw new Error("Failed to send email: " + emailError.message);
    }
  } catch (error) {
    console.error("[OTP] Error sending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP: " + error.message,
    });
  }
};

// Verify OTP and return redemption code
export const verifyRedemptionOTP = async (req, res) => {
  try {
    console.log("[OTP Verify] Request received:", req.user);
    const { otp } = req.body;
    const userId = req.user._id;
    console.log("[OTP Verify] User ID:", userId);

    // Find the latest OTP for this user
    const otpRecord = await OTP.findOne({
      userId,
      verified: false,
    }).sort({ createdAt: -1 });
    console.log("[OTP Verify] Found OTP record:", otpRecord ? "yes" : "no");

    if (!otpRecord) {
      return res.status(404).json({
        success: false,
        message: "No OTP found or OTP expired",
      });
    }

    // Verify OTP
    const isValid = await otpRecord.verifyOTP(otp);
    console.log("[OTP Verify] OTP valid:", isValid);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      if (otpRecord.attempts >= 3) {
        await otpRecord.deleteOne();
        return res.status(400).json({
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
        attemptsLeft: 3 - otpRecord.attempts,
      });
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();
    console.log("[OTP Verify] OTP marked as verified");

    // Generate redemption code (8 characters)
    const redemptionCode = Math.random()
      .toString(36)
      .substring(2, 10)
      .toUpperCase();
    console.log("[OTP Verify] Generated redemption code");

    res.json({
      success: true,
      redemptionCode,
    });
  } catch (error) {
    console.error("[OTP Verify] Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP: " + error.message,
    });
  }
};
