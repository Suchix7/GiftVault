import Voucher from "../models/VoucherModel.js";
import { User } from "../models/UserModel.js";
import {
  encrypt,
  decrypt,
  generateVoucherCode,
  getPrivateKey,
} from "../utils/encryption.js";
import { sendPrivateKeyEmail } from "../utils/emailService.js";

// Create a new voucher
export const createVoucher = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const voucherData = req.body;

    // Generate voucher code and encryption keys
    const voucherCode = generateVoucherCode();
    const privateKey = getPrivateKey();
    const encryptedCode = encrypt(voucherCode, privateKey);

    // Create the voucher with encrypted code
    const voucher = await Voucher.create({
      ...voucherData,
      vendorId,
      encryptedCode,
      privateKey, // This will be removed after first use
      publicKey: {
        // Store any public information needed
        length: voucherCode.length,
        prefix: voucherCode.substring(0, 2),
      },
    });

    // Remove sensitive data before sending response
    const voucherResponse = voucher.toObject();
    delete voucherResponse.privateKey;
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
      .select("+privateKey +encryptedCode")
      .sort({ createdAt: -1 });

    // Add decrypted codes for debugging
    const vouchersWithDecryptedCodes = vouchers.map((voucher) => {
      const voucherObj = voucher.toObject();
      try {
        if (voucherObj.encryptedCode && voucherObj.privateKey) {
          const decryptedCode = decrypt(
            voucherObj.encryptedCode,
            voucherObj.privateKey
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
          error
        );
      }

      // Remove sensitive data before sending
      delete voucherObj.privateKey;
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

// Get voucher code (for customers)
export const redeemVoucher = async (req, res) => {
  try {
    const customerId = req.user._id;
    const { id } = req.params;
    let { privateKey } = req.body;

    console.log("[DEBUG] Redeem request received:", {
      customerId,
      voucherId: id,
      privateKeyType: typeof privateKey,
      privateKeyValue: privateKey,
      rawBody: JSON.stringify(req.body),
    });

    // Find the voucher and check if it's active
    const voucher = await Voucher.findOne({
      _id: id,
      status: "active",
      expiryDate: { $gt: new Date() }, // Check if not expired
    }).select("+privateKey +encryptedCode"); // Explicitly include both fields

    if (!voucher) {
      console.log("[DEBUG] Voucher not found or inactive");
      return res.status(404).json({
        success: false,
        message: "Voucher not found or is no longer active",
      });
    }

    console.log("[DEBUG] Found voucher:", {
      id: voucher._id,
      status: voucher.status,
      hasPrivateKey: !!voucher.privateKey,
      storedKey: voucher.privateKey,
      hasEncryptedCode: !!voucher.encryptedCode,
    });

    // Check if customer has already redeemed this voucher
    if (voucher.isRedeemedByUser(customerId)) {
      console.log("[DEBUG] Voucher already redeemed by user");
      return res.status(400).json({
        success: false,
        message: "You have already redeemed this voucher",
      });
    }

    // Check if voucher has reached maximum redemptions
    if (
      voucher.maxRedemptions !== -1 &&
      voucher.redeemedCount >= voucher.maxRedemptions
    ) {
      console.log("[DEBUG] Voucher maximum redemptions reached");
      return res.status(400).json({
        success: false,
        message: "This voucher has reached its maximum number of redemptions",
      });
    }

    // If no private key provided, generate and send one
    if (!privateKey) {
      // Generate new private key
      const newPrivateKey = getPrivateKey();
      console.log("[DEBUG] Generated new private key:", newPrivateKey);

      // Store the private key with the voucher
      await Voucher.findByIdAndUpdate(id, {
        privateKey: newPrivateKey,
      });

      // Send private key via email
      try {
        await sendPrivateKeyEmail(
          req.user.email,
          req.user.name,
          { name: voucher.name, value: voucher.value },
          newPrivateKey
        );

        return res.json({
          success: true,
          message: "Private key has been sent to your email",
          requiresKey: true,
        });
      } catch (emailError) {
        // If email fails, remove the stored private key
        await Voucher.findByIdAndUpdate(id, {
          $unset: { privateKey: "" },
        });
        console.error("[DEBUG] Error sending private key:", emailError);
        return res.status(500).json({
          success: false,
          message: "Failed to send private key. Please try again.",
        });
      }
    }

    try {
      if (!voucher.encryptedCode) {
        console.error("[DEBUG] No encrypted code found for voucher");
        return res.status(400).json({
          success: false,
          message: "Voucher has no encrypted code",
        });
      }

      if (!voucher.privateKey) {
        console.error("[DEBUG] No stored private key found for voucher");
        return res.status(400).json({
          success: false,
          message: "No private key found for this voucher",
        });
      }

      console.log("[DEBUG] Attempting decryption with:", {
        encryptedCode: voucher.encryptedCode,
        providedKey: privateKey,
        storedKey: voucher.privateKey,
      });

      // Attempt to decrypt the voucher code
      const decryptedCode = decrypt(voucher.encryptedCode, privateKey);
      console.log("[DEBUG] Successfully decrypted code:", decryptedCode);

      // Return the decrypted code without marking as redeemed
      res.json({
        success: true,
        message:
          "Voucher code retrieved successfully. Present this code to the vendor to complete redemption.",
        voucher: {
          ...voucher.toObject(),
          decryptedCode,
        },
      });
    } catch (error) {
      console.error("[DEBUG] Decryption error:", {
        error: error.message,
        stack: error.stack,
        privateKeyType: typeof privateKey,
        privateKeyValue: privateKey,
      });
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
    console.error("[DEBUG] Redemption error:", {
      error: error.message,
      stack: error.stack,
    });
    res.status(500).json({
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
    const vouchers = await Voucher.find({
      status: "active",
      expiryDate: { $gt: new Date() },
    }).select("+privateKey +encryptedCode"); // Include both private key and encrypted code

    // Try to find the voucher with matching code
    let matchedVoucher = null;
    for (const voucher of vouchers) {
      try {
        // First try to decrypt if it's an encrypted code
        if (voucher.encryptedCode && voucher.privateKey) {
          try {
            const decryptedCode = decrypt(
              voucher.encryptedCode,
              voucher.privateKey
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
          error
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
    }).select("+privateKey +encryptedCode");

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
    if (voucher.encryptedCode && voucher.privateKey) {
      try {
        const decryptedCode = decrypt(
          voucher.encryptedCode,
          voucher.privateKey
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
      { new: true }
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
