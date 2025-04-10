import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";
import { User } from "../models/UserModel.js";

// authMiddleware.js
export const protect = async (req, res, next) => {
  let token = req.cookies.token;

  if (!token) {
    console.log("[Auth] No token found");
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      console.log("[Auth] User not found in database");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("[Auth] Token verification failed:", error.message);
    return res.status(401).json({ message: "Not authorized" });
  }
};
