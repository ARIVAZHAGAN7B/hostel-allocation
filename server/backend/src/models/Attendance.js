import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    status: { type: String, enum: ["Present", "Absent", "Leave"], required: true },
    regNo: { type: String, required: true },
  },
  { timestamps: true }
);

export const Attendance = mongoose.model("Attendance", attendanceSchema);
