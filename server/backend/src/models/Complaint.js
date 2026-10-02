import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    student: { type: String, required: true },
    regNo: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    hostel: { type: String, required: true },
    room: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
    createdAt: { type: String, required: true },
    assignedTo: { type: String, default: "Maintenance Team" },
  },
  { timestamps: true }
);

export const Complaint = mongoose.model("Complaint", complaintSchema);
