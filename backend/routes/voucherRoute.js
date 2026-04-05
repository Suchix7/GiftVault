import express from "express";
import Voucher from "../models/VoucherModel.js";
import {
  createVoucher,
  getVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
  getAllActiveVouchers,
  redeemVoucher,
  completeVoucherRedemption,
  findVoucherByCode,
  decodeQrPayload,
  uploadVoucherImage,
  upload,
} from "../controllers/voucherController.js";
import { protect, isVendor } from "../middleware/authMiddleware.js";

const router = express.Router();

// Vendor routes (protected and require vendor role)
router.get("/", protect, isVendor, getVouchers); // Get vendor's vouchers
router.post("/", protect, isVendor, createVoucher); // Create voucher
router.patch("/:id", protect, isVendor, updateVoucher); // Update voucher
router.delete("/:id", protect, isVendor, deleteVoucher); // Delete voucher
router.get("/:id", protect, isVendor, getVoucher); // Get single vendor voucher
router.post(
  "/upload-image",
  protect,
  isVendor,
  upload.single("image"),
  uploadVoucherImage,
); // Upload voucher image
router.post("/redeem/complete", protect, isVendor, completeVoucherRedemption);

// Redemption routes
router.post("/find-by-code", protect, isVendor, findVoucherByCode);
router.post("/decode-qr", protect, isVendor, decodeQrPayload);

// Customer routes
router.get("/public/active", getAllActiveVouchers); // Get all active vouchers (public)
router.post("/:id/redeem", protect, redeemVoucher); // Redeem voucher (requires customer auth)

export default router;
