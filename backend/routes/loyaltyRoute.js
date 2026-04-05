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
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/verify-qr", verifyQRToken);
router.get("/progress/:userId/:vendorId", getUserProgress);
router.get("/rules/:vendorId", getLoyaltyRules);

// Vendor/Admin routes (add authentication middleware as needed)
router.post("/generate-qr", protect, generateQRToken);
router.patch("/rules/:vendorId", protect, updateLoyaltyRules);
router.post("/claim-reward", protect, claimReward);
router.get("/vendor-stats/:vendorId", protect, getVendorLoyaltyStats);

export default router;
