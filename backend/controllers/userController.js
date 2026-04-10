import { User } from "../models/UserModel.js";
import bcrypt from "bcryptjs";

import Voucher from "../models/VoucherModel.js";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, number, vendorCategory } = req.body;

    // Check if user exists - more specific error message
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        error: "EMAIL_EXISTS",
        message: "A user with this email already exists",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      companyName,
      number,
      vendorCategory: role === "vendor" ? vendorCategory : undefined,
      isApproved: role === "vendor" ? false : true,
    });

    if (user) {
      const { password, ...userWithoutPassword } = user._doc;
      res.status(201).json(userWithoutPassword);
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({
      error: "SERVER_ERROR",
      message: error.message,
    });
  }
};
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        let vouchersCreated = 0;
        let vouchersRedeemed = user.redeemedVouchers?.length || 0;

        if (user.role === "vendor") {
          vouchersCreated = await Voucher.countDocuments({
            vendorId: user._id,
          });
        }

        return {
          ...user.toObject(),
          vouchersCreated,
          vouchersRedeemed,
        };
      })
    );

    res.json(enrichedUsers);
  } catch (err) {
    console.error("Error enriching users:", err);
    res.status(500).json({ message: "Failed to fetch user data" });
  }
};

// Update any user fields
// export const updateUser = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updates = req.body;

//     // Prevent password change here unless specifically handling hashing
//     if (updates.password) {
//       return res
//         .status(400)
//         .json({ message: "Password update not allowed here" });
//     }

//     const user = await User.findByIdAndUpdate(id, updates, {
//       new: true,
//     }).select("-password");

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.status(200).json(user);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new object with only the fields we want to update
    const updateData = {
      name: updates.name || user.name,
      email: updates.email || user.email,
      companyName: updates.companyName || user.companyName,
      number: updates.number || user.number,
      isApproved:
        updates.isApproved !== undefined ? updates.isApproved : user.isApproved,
    };

    // Category protection: Only admins can change vendor category after initial registration
    if (updates.vendorCategory && req.user?.role === "admin") {
      updateData.vendorCategory = updates.vendorCategory;
    } else {
      updateData.vendorCategory = user.vendorCategory;
    }

    // Only update password if it's provided and not empty
    if (updates.password && updates.password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(updates.password, salt);
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      select: "-password", // Don't return the password in the response
    });

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("[Error] Update user failed:", error.message);
    res.status(500).json({ message: error.message });
  }
};
