import "dotenv/config";
import express from "express";
import { PORT } from "./config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import voucherRoutes from "./routes/voucherRoute.js";
import otpRoutes from "./routes/otpRoutes.js";
import authRoute from "./routes/authRoute.js";
import booksRoute from "./routes/booksRoute.js";
import connectDB from "./config/db.js";

// Debug environment variables
console.log("[Config] Environment check:");
console.log("[Config] EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("[Config] EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
console.log("[Config] MONGODB_URI exists:", !!process.env.MONGODB_URI);

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/otp", otpRoutes);
app.use("/books", booksRoute); // Consider updating this to use /api prefix

// Welcome route
app.get("/", (request, response) => {
  return response.status(200).send("Welcome to GiftVault API");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong!",
  });
});

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
