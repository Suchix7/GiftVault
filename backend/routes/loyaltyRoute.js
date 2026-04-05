import express from "express";
import {
  getLoyaltyRules,
  updateLoyaltyRules,
  generateQRToken,
  verifyQRToken,
  getUserProgress,
  claimReward,
  getVendorLoyaltyStats,
} from "../controllers/loyaltyController.js";
import { protect, isVendor } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/verify-qr", verifyQRToken);
router.get("/progress/:userId/:vendorId", getUserProgress);
router.get("/rules/:vendorId", getLoyaltyRules);

// Vendor/Admin routes
router.post("/generate-qr", protect, isVendor, generateQRToken);
router.patch("/rules/:vendorId", protect, isVendor, updateLoyaltyRules);
router.post("/claim-reward", protect, isVendor, claimReward);
router.get("/vendor-stats/:vendorId", protect, isVendor, getVendorLoyaltyStats);

export default router;
