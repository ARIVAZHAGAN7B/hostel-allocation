import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    student: { type: String, required: true },
    regNo: { type: String, required: true },
    term: { type: String, required: true },
    amount: { type: Number, required: true },
    paid: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending", "Partial"], required: true },
    date: { type: String, required: true },
    mode: { type: String, required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
