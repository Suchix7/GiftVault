import { User } from "../models/UserModel.js";

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

// Update user approval status
export const updateUserApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { isApproved } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
