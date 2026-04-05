import mongoose from "mongoose";
import { User } from "./models/UserModel.js";
import connectDB from "./config/db.js";
import dotenv from "dotenv";

dotenv.config();

const insertAdmin = async () => {
  try {
    // Connect to database
    await connectDB();

    // Admin data
    const adminData = {
      name: "Admin User",
      email: "admin@giftvault.com",
      password: "admin123", // This will be hashed by the pre-save hook
      role: "admin",
      companyName: "GiftVault",
      number: "1234567890",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log("Admin already exists!");
      process.exit(0);
    }

    // Create admin
    const admin = new User(adminData);
    await admin.save();

    console.log("Admin inserted successfully!");
    console.log("Email:", admin.email);
    console.log("Password: admin123 (change this after first login)");

    process.exit(0);
  } catch (error) {
    console.error("Error inserting admin:", error.message);
    process.exit(1);
  }
};

insertAdmin();