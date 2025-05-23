import Voucher from "../models/VoucherModel.js";
import { User } from "../models/UserModel.js";

// Create a new voucher
export const createVoucher = async (req, res) => {
  try {
    const vendorId = req.user._id;
    if (!vendorId) {
      return res
        .status(400)
        .json({ success: false, message: "Vendor ID is required" });
    }

    const { name, value, description, campaign, color, logo, expiryDate } =
      req.body;

    // Validate required fields
    if (!name || !value) {
      return res
        .status(400)
        .json({ success: false, message: "Name and Value are required" });
    }

    // Check if expiryDate is valid
    if (expiryDate && isNaN(new Date(expiryDate).getTime())) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid expiry date" });
    }

    // Create a new voucher
    const voucher = new Voucher({
      vendorId,
      name,
      value,
      description,
      campaign,
      color,
      logo,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await voucher.save();
    res.status(201).json({ success: true, voucher });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

// Get all vouchers for a vendor
export const getVouchers = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const { status, search } = req.query;

    let query = { vendorId }; // Only get vouchers for the current vendor

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { id: { $regex: search, $options: "i" } },
      ];
    }

    const vouchers = await Voucher.find(query).sort({ createdAt: -1 });
    res.json({ success: true, vouchers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single voucher for vendor
export const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findOne({
      _id: req.params.id,
      vendorId: req.user._id, // Only get if it belongs to the vendor
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update voucher
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (updates.expiryDate) {
      updates.expiryDate = new Date(updates.expiryDate);
    }

    const voucher = await Voucher.findOneAndUpdate(
      { _id: id, vendorId: req.user._id }, // Only update if it belongs to the vendor
      updates,
      { new: true }
    );

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    res.json({ success: true, voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete voucher
export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user._id, // Only delete if it belongs to the vendor
    });

    if (!voucher) {
      return res
        .status(404)
        .json({ success: false, message: "Voucher not found" });
    }

    res.json({ success: true, message: "Voucher deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public: Get all active vouchers (no auth required)
export const getAllActiveVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ status: "active" })
      .sort({ createdAt: -1 })
      .populate({
        path: "vendorId",
        select: "name companyName email", // Only select necessary fields
      });

    // Transform the data to include vendor information in a cleaner format
    const formattedVouchers = vouchers.map((voucher) => ({
      ...voucher.toObject(),
      vendor: {
        name: voucher.vendorId.companyName || voucher.vendorId.name,
        email: voucher.vendorId.email,
      },
      vendorId: voucher.vendorId._id, // Keep just the ID in vendorId field
    }));

    res.json({
      success: true,
      vouchers: formattedVouchers,
    });
  } catch (error) {
    console.error("Error fetching active vouchers:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Redeem voucher (for customers)
export const redeemVoucher = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { id } = req.params;

    // Find the voucher and check if it's active
    const voucher = await Voucher.findOne({
      _id: id,
      status: "active",
      expiryDate: { $gt: new Date() }, // Check if not expired
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found or is no longer active",
      });
    }

    // Check if customer has already redeemed this voucher
    const user = await User.findById(customerId);
    if (user.redeemedVouchers && user.redeemedVouchers.includes(id)) {
      return res.status(400).json({
        success: false,
        message: "You have already redeemed this voucher",
      });
    }

    // Update voucher redemption count
    voucher.redeemedCount += 1;
    if (voucher.redeemedCount >= voucher.maxRedemptions) {
      voucher.status = "expired";
    }
    await voucher.save();

    // Add voucher to user's redeemed vouchers
    if (!user.redeemedVouchers) {
      user.redeemedVouchers = [];
    }
    user.redeemedVouchers.push(id);
    await user.save();

    res.json({
      success: true,
      message: "Voucher redeemed successfully",
      voucher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
