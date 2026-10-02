import express from "express";
import { Application } from "../models/Application.js";
import { RoomChange } from "../models/RoomChange.js";

const router = express.Router();

// GET all hostel applications
router.get("/", async (req, res) => {
  try {
    const { regNo, status } = req.query;
    const query = {};
    if (regNo && regNo !== "undefined") {
      query.regNo = { $regex: new RegExp(`^${regNo.trim()}$`, "i") };
    }
    if (status && status !== "All") query.status = status;

    const apps = await Application.find(query).sort({ appliedDate: -1 });
    res.json(apps);
  } catch (error) {
    console.error("Fetch Applications Error:", error);
    res.status(500).json({ error: "Failed to fetch applications." });
  }
});

// POST new hostel allocation application
router.post("/apply", async (req, res) => {
  try {
    const { regNo, studentName, hostelId, hostelName, roomType, sharing, notes } = req.body;

    if (!regNo || !hostelId) {
      return res.status(400).json({ error: "Registration number and hostel selection are required." });
    }

    const count = await Application.countDocuments();
    const newApp = new Application({
      id: `APP${String(count + 1).padStart(3, "0")}`,
      regNo,
      studentName: studentName || "Student",
      hostelId,
      hostelName: hostelName || "Selected Block",
      roomType: roomType || "Non-AC",
      sharing: Number(sharing) || 2,
      notes: notes || "",
      status: "Pending Warden Review",
      appliedDate: new Date().toISOString().slice(0, 10),
    });

    await newApp.save();
    res.status(201).json({ message: "Hostel application submitted successfully", application: newApp });
  } catch (error) {
    console.error("Application Error:", error);
    res.status(500).json({ error: "Failed to submit hostel application." });
  }
});

// PATCH application status & manual room allotment
router.patch("/:id", async (req, res) => {
  try {
    const { status, allottedRoom } = req.body;
    const app = await Application.findOne({ id: req.params.id });
    if (!app) {
      return res.status(404).json({ error: "Application not found." });
    }
    if (status) app.status = status;
    if (allottedRoom) app.allottedRoom = allottedRoom;
    await app.save();

    if (status === "Approved" || status === "Room Allotted") {
      const roomNo = allottedRoom || app.allottedRoom || "101";
      const { Student } = await import("../models/Student.js");
      const { Room } = await import("../models/Room.js");
      const { Hostel } = await import("../models/Hostel.js");

      await Student.updateOne(
        { regNo: app.regNo },
        { $set: { hostel: app.hostelName, room: roomNo } }
      );

      // Increment room occupancy if room exists
      await Room.updateOne(
        { hostelName: app.hostelName, number: roomNo },
        { $inc: { occupied: 1 } }
      );
      await Hostel.updateOne(
        { name: app.hostelName },
        { $inc: { occupied: 1 } }
      );
    }

    res.json(app);
  } catch (error) {
    console.error("Update Application Status Error:", error);
    res.status(500).json({ error: "Failed to update application status." });
  }
});

// GET all room change requests
router.get("/room-change", async (req, res) => {
  try {
    const { regNo, status } = req.query;
    const query = {};
    if (regNo && regNo !== "undefined") {
      query.regNo = { $regex: new RegExp(`^${regNo.trim()}$`, "i") };
    }
    if (status && status !== "All") query.status = status;

    const requests = await RoomChange.find(query).sort({ appliedDate: -1 });
    res.json(requests);
  } catch (error) {
    console.error("Fetch Room Changes Error:", error);
    res.status(500).json({ error: "Failed to fetch room change requests." });
  }
});

// POST room change request
router.post("/room-change", async (req, res) => {
  try {
    const { regNo, studentName, currentHostel, currentRoom, targetHostel, reason } = req.body;

    if (!regNo || !reason) {
      return res.status(400).json({ error: "Registration number and reason are required." });
    }

    const count = await RoomChange.countDocuments();
    const newRequest = new RoomChange({
      id: `RC${String(count + 1).padStart(3, "0")}`,
      regNo,
      studentName: studentName || "Student",
      currentHostel: currentHostel || "Sapphire Block",
      currentRoom: currentRoom || "312",
      targetHostel: targetHostel || "Emerald Block",
      reason,
      status: "Pending Warden Review",
      appliedDate: new Date().toISOString().slice(0, 10),
    });

    await newRequest.save();
    res.status(201).json({ message: "Room change request submitted successfully", request: newRequest });
  } catch (error) {
    console.error("Room Change Error:", error);
    res.status(500).json({ error: "Failed to submit room change request." });
  }
});

// PATCH room change status & manual room allotment
router.patch("/room-change/:id", async (req, res) => {
  try {
    const { status, allottedRoom } = req.body;
    const rc = await RoomChange.findOne({ id: req.params.id });
    if (!rc) {
      return res.status(404).json({ error: "Room change request not found." });
    }
    if (status) rc.status = status;
    if (allottedRoom) rc.allottedRoom = allottedRoom;
    await rc.save();

    if (status === "Approved" || status === "Room Allotted") {
      const roomNo = allottedRoom || rc.allottedRoom || "204";
      const { Student } = await import("../models/Student.js");
      const { Room } = await import("../models/Room.js");
      const { Hostel } = await import("../models/Hostel.js");

      await Student.updateOne(
        { regNo: rc.regNo },
        { $set: { hostel: rc.targetHostel, room: roomNo } }
      );

      await Room.updateOne(
        { hostelName: rc.targetHostel, number: roomNo },
        { $inc: { occupied: 1 } }
      );
      await Hostel.updateOne(
        { name: rc.targetHostel },
        { $inc: { occupied: 1 } }
      );
    }

    res.json(rc);
  } catch (error) {
    console.error("Update Room Change Status Error:", error);
    res.status(500).json({ error: "Failed to update room change status." });
  }
});

export default router;
