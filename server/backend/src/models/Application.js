import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    regNo: { type: String, required: true },
    studentName: { type: String, required: true },
    hostelId: { type: String, required: true },
    hostelName: { type: String, required: true },
    roomType: { type: String, enum: ["AC", "Non-AC"], required: true },
    sharing: { type: Number, required: true },
    notes: { type: String },
    status: { type: String, default: "Pending Warden Review" },
    allottedRoom: { type: String, default: "" },
    appliedDate: { type: String, required: true },
  },
  { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);
