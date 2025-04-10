import express from "express";
import { User } from "../models/UserModel.js";
import { createUser, updateUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/", createUser);
router.patch("/:id", protect, updateUser);
router.patch("/approve/:vendorId", async (req, res) => {
  const { vendorId } = req.params; // Get the vendorId from URL params
  const { isApproved } = req.body; // Get the new approval status from request body

  try {
    // Find the user by vendorId and update the isApproved status
    const updatedUser = await User.findByIdAndUpdate(
      vendorId,
      { isApproved: isApproved },
      { new: true } // Return the updated document
    ).select("-password"); // Exclude the password from the response

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the updated user data
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating approval status:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
