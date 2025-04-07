import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { User } from "../models/userModel.js";

// authMiddleware.js
export const protect = async (req, res, next) => {
  console.log("[Auth] Checking authentication...");
  let token = req.cookies.token;

  if (!token) {
    console.log("[Auth] No token found");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    console.log("[Auth] Verifying token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[Auth] Token decoded:", decoded);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("[Auth] User not found in database");
      return res.status(401).json({ message: "User not found" });
    }

    console.log("[Auth] User authenticated:", user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
