import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import hostelRoutes from "./routes/hostels.js";
import roomRoutes from "./routes/rooms.js";
import roommateRoutes from "./routes/roommates.js";
import complaintRoutes from "./routes/complaints.js";
import paymentRoutes from "./routes/payments.js";
import attendanceRoutes from "./routes/attendance.js";
import notificationRoutes from "./routes/notifications.js";
import applicationRoutes from "./routes/applications.js";
import statsRoutes from "./routes/stats.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bit_roomie_connect";

// CORS & Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "BIT Roomie Connect Backend API",
    dbState: mongoose.connection.readyState === 1 ? "Connected to MongoDB" : "Connecting...",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/roommates", roommateRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/stats", statsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Unhandled Backend Error:", err);
  res.status(500).json({ error: "Internal Server Error", details: err.message });
});

// Connect Database & Start Server
async function startServer() {
  try {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB Atlas connected successfully.");

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(` BIT Roomie Connect Backend Server Running`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error(`\n❌ Could not connect to MongoDB: ${error.message}`);
    console.error(`👉 Please update the MONGODB_URI in "backend/.env" with your valid MongoDB Atlas connection string.`);
    console.error(`   Example: MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/bit_roomie_connect?retryWrites=true&w=majority\n`);
  }
}

startServer();
