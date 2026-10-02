import express from "express";
import { Hostel } from "../models/Hostel.js";
import { Room } from "../models/Room.js";
import { Student } from "../models/Student.js";
import { Complaint } from "../models/Complaint.js";

const router = express.Router();

// GET portal summary statistics
router.get("/", async (req, res) => {
  try {
    const [totalStudents, totalRooms, hostels, totalComplaints, pendingComplaints] = await Promise.all([
      Student.countDocuments(),
      Room.countDocuments(),
      Hostel.find(),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: { $ne: "Resolved" } }),
    ]);

    const boysHostels = hostels.filter((h) => h.type === "Boys").length;
    const girlsHostels = hostels.filter((h) => h.type === "Girls").length;
    const totalCapacity = hostels.reduce((sum, h) => sum + h.capacity, 0);
    const totalOccupied = hostels.reduce((sum, h) => sum + h.occupied, 0);

    const occupancyByHostel = hostels.map((h) => ({
      name: h.name.replace(" Block", ""),
      occupied: h.occupied,
      vacant: h.capacity - h.occupied,
    }));

    res.json({
      stats: {
        students: totalStudents,
        rooms: totalRooms,
        hostels: hostels.length,
        boys: boysHostels,
        girls: girlsHostels,
        capacity: totalCapacity,
        occupied: totalOccupied,
        complaints: totalComplaints,
        pendingComplaints,
      },
      occupancyByHostel,
    });
  } catch (error) {
    console.error("Fetch Stats Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics." });
  }
});

export default router;
