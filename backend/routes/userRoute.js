import express from "express";
import { User } from "../models/UserModel.js";
import {
  createUser,
  updateUserApproval,
} from "../controllers/userController.js";

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
router.patch("/:id", updateUserApproval);

router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { isApproved } = req.body;

  if (typeof isApproved !== "boolean") {
    return res.status(400).json({ error: "isApproved must be a boolean" });
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user approval:", error);
    res.status(500).json({ error: "Internal server error" });
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
