const express = require("express");
const cors = require("cors");
const path = require("path");
const uploadRoutes = require("./routes/upload");

const app = express();

app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/upload", uploadRoutes);

// Other routes...

module.exports = app;
