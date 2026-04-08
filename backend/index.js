import "dotenv/config";
import express from "express";
import path from "path";
import { PORT } from "./config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";
import voucherRoutes from "./routes/voucherRoute.js";
import otpRoutes from "./routes/otpRoutes.js";
import authRoute from "./routes/authRoute.js";
import booksRoute from "./routes/booksRoute.js";
import loyaltyRoute from "./routes/loyaltyRoute.js";
import connectDB from "./config/db.js";

// Debug environment variables
console.log("[Config] Environment check:");
console.log("[Config] EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("[Config] EMAIL_PASSWORD exists:", !!process.env.EMAIL_PASSWORD);
console.log("[Config] MONGODB_URI exists:", !!process.env.MONGODB_URI);

const app = express();
const HOST = '0.0.0.0'; 

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// CORS configuration
const allowedOrigins = [
  "https://localhost:5173",
  "http://localhost:5179",
  "http://localhost:5178",
  "http://localhost:5555",
  "http://172.16.50.11:5173",
  "https://172.16.30.237:5173",
  "https://192.168.120.140:5173",
  "http://172.16.30.237:5173",
  "http://192.168.120.140:5555",
  "https://kenny-erubescent-contumely.ngrok-free.dev",
  "https://bpsxm4qr-5555.inc1.devtunnels.ms"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS origin denied"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/loyalty", loyaltyRoute);
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
    app.listen(PORT,HOST, () => {
      console.log(`Server running on port ${PORT} (http://localhost:${PORT})`);
      console.log(`Accessible on your network at http://<YOUR_IP>:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
