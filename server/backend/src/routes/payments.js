import express from "express";
import { Payment } from "../models/Payment.js";

const router = express.Router();

// GET payment transactions
router.get("/", async (req, res) => {
  try {
    const { regNo, status } = req.query;
    const query = {};

    if (regNo) query.regNo = regNo;
    if (status && status !== "All") query.status = status;

    const payments = await Payment.find(query).sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    console.error("Fetch Payments Error:", error);
    res.status(500).json({ error: "Failed to fetch payments." });
  }
});

// POST process payment
router.post("/pay", async (req, res) => {
  try {
    const { student, regNo, term, amount, mode } = req.body;

    const count = await Payment.countDocuments();
    const newPayment = new Payment({
      id: `P${String(count + 1).padStart(3, "0")}`,
      student: student || "Student",
      regNo,
      term: term || "2026 Term I",
      amount: Number(amount) || 52000,
      paid: Number(amount) || 52000,
      status: "Paid",
      date: new Date().toISOString().slice(0, 10),
      mode: mode || "UPI",
    });

    await newPayment.save();
    res.status(201).json(newPayment);
  } catch (error) {
    console.error("Payment Error:", error);
    res.status(500).json({ error: "Failed to record payment transaction." });
  }
});

export default router;
