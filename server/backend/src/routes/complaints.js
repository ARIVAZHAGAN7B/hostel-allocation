import express from "express";
import { Complaint } from "../models/Complaint.js";

const router = express.Router();

// GET complaints with optional category & status filters
router.get("/", async (req, res) => {
  try {
    const { category, status, regNo } = req.query;
    const query = {};

    if (category && category !== "All") query.category = category;
    if (status && status !== "All") query.status = status;
    if (regNo) query.regNo = regNo;

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    console.error("Fetch Complaints Error:", error);
    res.status(500).json({ error: "Failed to fetch complaints." });
  }
});

// POST file a new complaint
router.post("/", async (req, res) => {
  try {
    const { student, regNo, category, title, hostel, room, priority } = req.body;

    if (!student || !regNo || !title || !category) {
      return res.status(400).json({ error: "Required fields missing." });
    }

    const count = await Complaint.countDocuments();
    const newComplaint = new Complaint({
      id: `C${String(count + 1).padStart(3, "0")}`,
      student,
      regNo,
      category,
      title,
      hostel: hostel || "Sapphire Block",
      room: room || "312",
      priority: priority || "Medium",
      status: "Pending",
      createdAt: new Date().toISOString().slice(0, 10),
      assignedTo: "Maintenance Team",
    });

    await newComplaint.save();
    res.status(201).json(newComplaint);
  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ error: "Failed to file complaint." });
  }
});

// PATCH update complaint status
router.patch("/:id", async (req, res) => {
  try {
    const { status, assignedTo } = req.body;
    const complaint = await Complaint.findOne({ id: req.params.id });

    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found." });
    }

    if (status) complaint.status = status;
    if (assignedTo) complaint.assignedTo = assignedTo;

    await complaint.save();
    res.json(complaint);
  } catch (error) {
    console.error("Update Complaint Error:", error);
    res.status(500).json({ error: "Failed to update complaint." });
  }
});

export default router;
