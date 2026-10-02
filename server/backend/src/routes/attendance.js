import express from "express";
import { Attendance } from "../models/Attendance.js";

const router = express.Router();

// GET attendance history
router.get("/", async (req, res) => {
  try {
    const { regNo, status } = req.query;
    const query = {};

    if (regNo) query.regNo = regNo;
    if (status && status !== "All") query.status = status;

    const records = await Attendance.find(query).sort({ date: -1 }).limit(200);
    res.json(records);
  } catch (error) {
    console.error("Fetch Attendance Error:", error);
    res.status(500).json({ error: "Failed to fetch attendance history." });
  }
});

// POST mark/log attendance
router.post("/", async (req, res) => {
  try {
    const { regNo, studentName, date, status, hostel, room } = req.body;

    if (!regNo) {
      return res.status(400).json({ error: "Registration number is required." });
    }

    const count = await Attendance.countDocuments();
    const newRecord = new Attendance({
      id: `ATT${String(count + 1).padStart(4, "0")}`,
      regNo,
      studentName: studentName || "Student",
      date: date || new Date().toISOString().slice(0, 10),
      status: status || "Present",
      hostel: hostel || "Sapphire Block",
      room: room || "312",
    });

    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    console.error("Mark Attendance Error:", error);
    res.status(500).json({ error: "Failed to mark attendance." });
  }
});

export default router;
