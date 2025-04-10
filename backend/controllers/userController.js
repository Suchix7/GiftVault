import { User } from "../models/UserModel.js";
import bcrypt from "bcryptjs";

// Create a new user
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, companyName, number } = req.body;

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
    const { id } = req.params; // User ID to be updated
    const updates = req.body;

    // Check if the authenticated user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message:
          "Admin privileges are required to update another user's password",
      });
    }

    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Handle password update securely if the admin is updating the password
    if (updates.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updates.password, salt);
      updates.password = hashedPassword;
    }

    // Update the user with the new data
    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
    });

    // Return the updated user without sending the password
    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("[Error] Update user failed:", error.message);
    res.status(500).json({ message: error.message });
  }
};
