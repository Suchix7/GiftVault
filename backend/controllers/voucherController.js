import Voucher from "../models/VoucherModel.js";
import { User } from "../models/UserModel.js";

// Create a new voucher
export const createVoucher = async (req, res) => {
  try {
    // Log the user and payload to check values
    console.log("User:", req.user._id);
    console.log("Request Body:", req.body);
    // Add this at the start of your route
    if (Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: "Expected single voucher object, got array",
      });
    }
    // Ensure vendorId exists from the user data
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

    // Save the voucher
    await voucher.save();

    // Send success response
    res.status(201).json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error("Error creating voucher:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

// Get all vouchers for a vendor
export const getVouchers = async (req, res) => {
  try {
    const { vendorId } = req.user;
    const { status, search } = req.query;

    let query = { vendorId };

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

    res.json({
      success: true,
      vouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single voucher
export const getVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findOne({
      _id: req.params.id,
      vendorId: req.user.vendorId,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.json({
      success: true,
      voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update voucher
export const updateVoucher = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Fix the expiryDate handling
    if (updates.expiryDate) {
      updates.expiryDate = new Date(updates.expiryDate);
    }

    // Option 1: If authentication is enough (recommended)
    const voucher = await Voucher.findOneAndUpdate(
      { _id: id }, // Just check the ID
      updates,
      { new: true }
    );

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.json({
      success: true,
      voucher,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete voucher
export const deleteVoucher = async (req, res) => {
  try {
    const voucher = await Voucher.findOneAndDelete({
      _id: req.params.id,
      vendorId: req.user.vendorId,
    });

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found",
      });
    }

    res.json({
      success: true,
      message: "Voucher deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Public: Get all active vouchers (no auth required)
export const getAllActiveVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({ status: "active" }).sort({
      createdAt: -1,
    });
    res.json({
      success: true,
      vouchers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update voucher status
// export const updateVoucherStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     if (!["active", "expired", "draft", "redeemed"].includes(status)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid status",
//       });
//     }

//     const voucher = await Voucher.findOneAndUpdate(
//       { _id: id, vendorId: req.user.vendorId },
//       { status },
//       { new: true }
//     );

//     if (!voucher) {
//       return res.status(404).json({
//         success: false,
//         message: "Voucher not found",
//       });
//     }

//     res.json({
//       success: true,
//       voucher,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
