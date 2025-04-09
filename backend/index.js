import express from "express";
import { PORT, mongoDBURL } from "./config.js";
import mongoose from "mongoose";
import booksRoute from "./routes/booksRoute.js";
import authRoute from "./routes/authRoute.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/userRoute.js";

const app = express();
app.use(cookieParser());
// Middleware
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Your frontend URL
    credentials: true, // Allow credentials
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);

// Routes
app.get("/", (request, response) => {
  return response.status(234).send("Welcome to GiftVault API");
});

app.use("/api/auth", authRoute); // Changed to /api/auth to match frontend
// Add this with your other routes
app.use("/books", booksRoute);
app.use("/api/users", userRoute);
// Database connection
mongoose
  .connect(mongoDBURL)
  .then(() => {
    console.log("App connected to database");
    app.listen(PORT, () => {
      console.log(`App is listening to port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
  });
