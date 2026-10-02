import express from "express";
import { Hostel } from "../models/Hostel.js";
import { Room } from "../models/Room.js";

const router = express.Router();

// GET all hostels with filtering & sorting
router.get("/", async (req, res) => {
  try {
    const { type, search } = req.query;
    const query = {};

    if (type && type !== "All") {
      query.type = type;
    }
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const hostels = await Hostel.find(query).sort({ name: 1 });
    res.json(hostels);
  } catch (error) {
    console.error("Fetch Hostels Error:", error);
    res.status(500).json({ error: "Failed to fetch hostels." });
  }
});

// GET single hostel block by ID with associated rooms
router.get("/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findOne({ id: req.params.id });
    if (!hostel) {
      return res.status(404).json({ error: "Hostel block not found." });
    }

    const rooms = await Room.find({ hostelId: hostel.id }).sort({ number: 1 });
    res.json({ hostel, rooms });
  } catch (error) {
    console.error("Fetch Hostel Details Error:", error);
    res.status(500).json({ error: "Failed to fetch hostel details." });
  }
});

export default router;
