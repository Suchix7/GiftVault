import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { User } from "../models/UserModel.js";

// authMiddleware.js
export const protect = async (req, res, next) => {
  let token = req.cookies.token;
  console.log("[Auth] Received cookies:", req.cookies);
  console.log("[Auth] Token from cookie:", token);
  console.log("[Auth] JWT_SECRET:", JWT_SECRET);

  if (!token) {
    console.log("[Auth] No token found");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    console.log("[Auth] Attempting to verify token...");
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("[Auth] Decoded token:", decoded);
    console.log("[Auth] Looking for user with ID:", decoded.id);

    const user = await User.findById(decoded.id).select("-password");
    console.log("[Auth] Found user:", user ? "yes" : "no");
    if (user) {
      console.log("[Auth] User details:", {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }

    if (!user) {
      console.log("[Auth] User not found in database");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    console.error("[Auth] Full error:", error);
    return res.status(401).json({ message: "Not authorized" });
  }
};
