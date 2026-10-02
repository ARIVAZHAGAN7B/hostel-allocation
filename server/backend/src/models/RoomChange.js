import mongoose from "mongoose";

const roomChangeSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    regNo: { type: String, required: true },
    studentName: { type: String, required: true },
    currentHostel: { type: String, required: true },
    currentRoom: { type: String, required: true },
    targetHostel: { type: String, required: true },
    reason: { type: String, required: true },
    status: { type: String, default: "Pending Warden Review" },
    allottedRoom: { type: String, default: "" },
    appliedDate: { type: String, required: true },
  },
  { timestamps: true }
);

export const RoomChange = mongoose.model("RoomChange", roomChangeSchema);
