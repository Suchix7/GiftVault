import otpRoutes from "./routes/otpRoutes.js";

// Routes
app.use("/api/users", userRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/otp", otpRoutes);
