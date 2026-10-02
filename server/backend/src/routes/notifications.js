import express from "express";
import { Notification } from "../models/Notification.js";

const router = express.Router();

// GET notifications
router.get("/", async (req, res) => {
  try {
    const { category, regNo } = req.query;
    const query = {};

    if (category && category !== "All") query.category = category;
    if (regNo) {
      query.$or = [{ regNo }, { regNo: null }];
    }

    const list = await Notification.find(query).sort({ date: -1 });
    res.json(list);
  } catch (error) {
    console.error("Fetch Notifications Error:", error);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// PATCH mark notification read
router.patch("/:id/read", async (req, res) => {
  try {
    const notification = await Notification.findOne({ id: req.params.id });
    if (!notification) {
      return res.status(404).json({ error: "Notification not found." });
    }

    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (error) {
    console.error("Update Notification Error:", error);
    res.status(500).json({ error: "Failed to update notification." });
  }
});

export default router;
