import express from "express";
import Voucher from "../models/VoucherModel.js";
import {
  createVoucher,
  getVoucher,
  getVouchers,
  updateVoucher,
  deleteVoucher,
  updateVoucherStatus,
} from "../controllers/voucherController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all vouchers
router.get("/", async (req, res) => {
  try {
    const vouchers = await Voucher.find();
    res.json(vouchers);
  } catch (error) {
    console.error("Error fetching vouchers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get voucher by ID
router.get("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findById(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.json(voucher);
  } catch (error) {
    console.error("Error fetching voucher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/", protect, createVoucher);

router.patch("/:id", updateVoucher);

// Delete voucher
router.delete("/:id", async (req, res) => {
  try {
    const voucher = await Voucher.findByIdAndDelete(req.params.id);
    if (!voucher) {
      return res.status(404).json({ message: "Voucher not found" });
    }
    res.status(200).json({ message: "Voucher deleted successfully" });
  } catch (error) {
    console.error("Error deleting voucher:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update voucher status
router.patch("/:id/status", updateVoucherStatus);

export default router;
