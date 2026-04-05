import Voucher from "../models/VoucherModel.js";
import { User } from "../models/UserModel.js";
import {
  encrypt,
  decrypt,
  encryptAES,
  decryptAES,
  generateVoucherCode,
  createQrToken,
  decodeQrToken,
} from "../utils/encryption.js";
import { sendPrivateKeyEmail } from "../utils/emailService.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "voucher-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Create a new voucher
export const createVoucher = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const voucherData = req.body;

    // Generate voucher code and encrypt it with a new RSA key pair
    const voucherCode = generateVoucherCode();
    const { encrypted: encryptedCode, privateKey } = encrypt(voucherCode);
    const encryptedPrivateKey = encryptAES(privateKey);

    // Create the voucher with encrypted code
    const voucher = await Voucher.create({
      ...voucherData,
      vendorId,
      encryptedCode,
      encryptedPrivateKey,
      publicKey: {
        length: voucherCode.length,
        prefix: voucherCode.substring(0, 2),
      },
    });

    // Remove sensitive data before sending response
    const voucherResponse = voucher.toObject();
    delete voucherResponse.encryptedPrivateKey;
    delete voucherResponse.encryptedCode;

    // Add the clear text code to the response
    voucherResponse.code = voucherCode;

    res.status(201).json({
      success: true,
      message: "Voucher created successfully",
      data: voucherResponse,
    });
  } catch (error) {
    console.error("Create voucher error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create voucher",
    });
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

    // Include privateKey and encryptedCode in the query
    const vouchers = await Voucher.find(query)
      .select("+encryptedPrivateKey +encryptedCode")

      .sort({ createdAt: -1 });

    // Add decrypted codes for debugging
    const vouchersWithDecryptedCodes = vouchers.map((voucher) => {
      const voucherObj = voucher.toObject();
      try {
        if (voucherObj.encryptedCode && voucherObj.encryptedPrivateKey) {
          const decryptedPrivateKey = decryptAES(
            voucherObj.encryptedPrivateKey,
          );
          const decryptedCode = decrypt(
            voucherObj.encryptedCode,
            decryptedPrivateKey,
          );

          console.log(`[DEBUG] Voucher ${voucherObj._id}:`, {
            name: voucherObj.name,
            decryptedCode,
            status: voucherObj.status,
          });
          voucherObj.decryptedCode = decryptedCode;
        }
      } catch (error) {
        console.error(
          `[DEBUG] Failed to decrypt voucher ${voucherObj._id}:`,
          error,
        );
      }

      // Remove sensitive data before sending
      delete voucherObj.encryptedPrivateKey;
      delete voucherObj.encryptedCode;
      return voucherObj;
    });

    res.json({ success: true, vouchers: vouchersWithDecryptedCodes });
  } catch (error) {
    console.error("[DEBUG] GetVouchers error:", error);
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
      { new: true },
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

// Get voucher code (for customers)
export const redeemVoucher = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { id } = req.params;
    const { privateKey } = req.body;

    const voucher = await Voucher.findOne({
      _id: id,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).select("+encryptedCode +encryptedPrivateKey");
    console.log(
      "[DEBUG] voucher.encryptedPrivateKey =",
      voucher.encryptedPrivateKey,
    );

    console.log("[DEBUG] Voucher fetched:", voucher);
    console.log("[DEBUG] Incoming body:", req.body);

    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found or is no longer active",
      });
    }

    if (voucher.isRedeemedByUser(customerId)) {
      return res.status(400).json({
        success: false,
        message: "You have already redeemed this voucher",
      });
    }

    if (
      voucher.maxRedemptions !== -1 &&
      voucher.redeemedCount >= voucher.maxRedemptions
    ) {
      return res.status(400).json({
        success: false,
        message: "This voucher has reached its maximum number of redemptions",
      });
    }

    if (
      !voucher.encryptedPrivateKey ||
      !voucher.encryptedPrivateKey.iv ||
      !voucher.encryptedPrivateKey.data
    ) {
      throw new Error("Invalid or missing encryptedPrivateKey structure");
    }

    // 🔐 If no private key provided, decrypt and email it
    if (!privateKey) {
      try {
        const decryptedKey = decryptAES(voucher.encryptedPrivateKey);
        await sendPrivateKeyEmail(
          req.user.email,
          req.user.name,
          {
            name: voucher.name,
            value: voucher.value,
            type: voucher.type,
            maxDiscount: voucher.maxDiscount,
          },
          decryptedKey,
        );

        return res.json({
          success: true,
          message: "Private key has been sent to your email",
          requiresKey: true,
        });
      } catch (emailError) {
        console.error("[ERROR] Failed to send email:", emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to send private key. Please try again.",
        });
      }
    }

    // 🔓 If private key was provided by user
    try {
      const rsaKeyToUse = privateKey || decryptAES(voucher.encryptedPrivateKey);

      if (!voucher.encryptedCode) {
        return res.status(400).json({
          success: false,
          message: "Voucher has no encrypted code",
        });
      }

      const decryptedCode = decrypt(voucher.encryptedCode, rsaKeyToUse);
      const qrToken = createQrToken({
        voucherId: voucher._id,
        customerEmail: req.user.email,
        voucherCode: decryptedCode,
      });

      return res.json({
        success: true,
        message:
          "Voucher code retrieved successfully. Present this code to the vendor to complete redemption.",
        qrToken,
        voucher: {
          ...voucher.toObject(),
          decryptedCode,
        },
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: `Decryption failed: ${error.message}`,
        details: {
          error: error.message,
          privateKeyType: typeof privateKey,
        },
      });
    }
  } catch (error) {
    console.error("[DEBUG] Redemption error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
      details: {
        error: error.message,
        type: error.constructor.name,
      },
    });
  }
};

// Find voucher by code
export const findVoucherByCode = async (req, res) => {
  try {
    const { voucherCode } = req.body;

    if (!voucherCode) {
      return res.status(400).json({
        success: false,
        message: "Voucher code is required",
      });
    }

    console.log("[DEBUG] Finding voucher with code:", voucherCode);

    // Find all active vouchers that haven't been redeemed
    const vendorId = req.user._id;
    console.log("[DEBUG] Vendor ID:", vendorId);
    const vouchers = await Voucher.find({
      vendorId: vendorId,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).select("+encryptedPrivateKey +encryptedCode");
    // Include both private key and encrypted code
    // Try to find the voucher with matching code
    let matchedVoucher = null;
    for (const voucher of vouchers) {
      try {
        // First try to decrypt if it's an encrypted code
        if (voucher.encryptedCode && voucher.encryptedPrivateKey) {
          try {
            const decryptedPrivateKey = decryptAES(voucher.encryptedPrivateKey);
            const decryptedCode = decrypt(
              voucher.encryptedCode,
              decryptedPrivateKey,
            );

            console.log("[DEBUG] Decrypted code:", decryptedCode);
            if (decryptedCode === voucherCode) {
              matchedVoucher = voucher;
              break;
            }
          } catch (decryptError) {
            console.log("[DEBUG] Decryption failed, trying direct match");
          }
        }

        // If decryption fails or no encryption, try direct match with the code
        if (voucher.code === voucherCode) {
          matchedVoucher = voucher;
          break;
        }
      } catch (error) {
        console.error(
          `[DEBUG] Error processing voucher ${voucher._id}:`,
          error,
        );
        continue;
      }
    }

    if (!matchedVoucher) {
      return res.status(404).json({
        success: false,
        message: "No active voucher found with this code",
      });
    }

    // Remove sensitive data before sending response
    const voucherResponse = matchedVoucher.toObject();
    delete voucherResponse.privateKey;
    delete voucherResponse.encryptedCode;

    res.json({
      success: true,
      message: "Voucher found successfully",
      voucher: voucherResponse,
    });
  } catch (error) {
    console.error("[DEBUG] Error finding voucher:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to find voucher",
    });
  }
};

// Decode encrypted QR payload for vendor redemption
export const decodeQrPayload = async (req, res) => {
  try {
    const { qrToken } = req.body;

    if (!qrToken) {
      return res.status(400).json({
        success: false,
        message: "QR token is required",
      });
    }

    const payload = decodeQrToken(qrToken);
    if (!payload?.voucherId || !payload?.customerEmail || !payload?.voucherCode) {
      return res.status(400).json({
        success: false,
        message: "QR token payload is invalid",
      });
    }

    res.json({
      success: true,
      message: "QR token decoded successfully",
      payload,
    });
  } catch (error) {
    console.error("[DEBUG] QR decode error:", error);
    res.status(400).json({
      success: false,
      message: "Failed to decode QR token",
    });
  }
};

// Complete voucher redemption (for vendors)
export const completeVoucherRedemption = async (req, res) => {
  try {
    const { customerEmail, voucherCode, voucherId } = req.body;

    if (!voucherId || !customerEmail || !voucherCode) {
      return res.status(400).json({
        success: false,
        message: "Voucher ID, customer email, and voucher code are required",
      });
    }

    console.log("[DEBUG] Completing redemption for:", {
      voucherId,
      customerEmail,
      voucherCode,
    });

    // Find the voucher and include the encrypted data
    const voucher = await Voucher.findOne({
      _id: voucherId,
      status: "active",
      expiryDate: { $gt: new Date() },
    }).select("+encryptedPrivateKey +encryptedCode");
    if (!voucher) {
      return res.status(404).json({
        success: false,
        message: "Voucher not found or is no longer active",
      });
    }

    // Find the customer
    const customer = await User.findOne({ email: customerEmail });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found with this email",
      });
    }

    // Check if customer has already redeemed this voucher
    if (voucher.isRedeemedByUser(customer._id)) {
      return res.status(400).json({
        success: false,
        message: "This customer has already redeemed this voucher",
      });
    }

    // Verify the voucher code
    let isCodeValid = false;

    // First try to verify encrypted code if it exists
    if (voucher.encryptedCode && voucher.encryptedPrivateKey) {
      try {
        const decryptedPrivateKey = decryptAES(voucher.encryptedPrivateKey);
        const decryptedCode = decrypt(
          voucher.encryptedCode,
          decryptedPrivateKey,
        );

        console.log("[DEBUG] Decrypted code:", decryptedCode);
        if (decryptedCode === voucherCode) {
          isCodeValid = true;
        }
      } catch (decryptError) {
        console.log("[DEBUG] Decryption failed, trying direct match");
      }
    }

    // If encryption check failed or no encryption, try direct match
    if (!isCodeValid && voucher.code === voucherCode) {
      isCodeValid = true;
    }

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher code",
      });
    }

    // Add redemption record to voucher
    voucher.addRedemption(customer._id, voucherCode);

    // Update voucher with redemption data but keep it active
    const updatedVoucher = await Voucher.findByIdAndUpdate(
      voucherId,
      {
        $inc: { redeemedCount: 1 },
        $push: {
          redemptions: {
            userId: customer._id,
            code: voucherCode,
            redeemedAt: new Date(),
          },
        },
      },
      { new: true },
    );

    // Add voucher to customer's redeemed vouchers
    await User.findByIdAndUpdate(customer._id, {
      $addToSet: { redeemedVouchers: voucherId },
    });

    res.json({
      success: true,
      message: "Voucher redeemed successfully",
      voucher: updatedVoucher,
    });
  } catch (error) {
    console.error("[DEBUG] Redemption error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to redeem voucher",
    });
  }
};

// Upload voucher image
export const uploadVoucherImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    // Create the image URL (assuming the uploads folder is served statically)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: "Image uploaded successfully",
      imageUrl: imageUrl,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload image",
    });
  }
};

export { upload };
