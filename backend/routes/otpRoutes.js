import express from "express";
import {
  sendRedemptionOTP,
  verifyRedemptionOTP,
} from "../controllers/otpController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to send OTP for voucher redemption
router.post("/send-redemption", protect, sendRedemptionOTP);

// Route to verify OTP and get redemption code
router.post("/verify-redemption", protect, verifyRedemptionOTP);

export default router;
