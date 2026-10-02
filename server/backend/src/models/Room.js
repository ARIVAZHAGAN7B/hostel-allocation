import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    hostelId: { type: String, required: true, ref: "Hostel" },
    hostelName: { type: String, required: true },
    number: { type: String, required: true },
    floor: { type: Number, required: true },
    capacity: { type: Number, required: true },
    occupied: { type: Number, required: true, default: 0 },
    type: { type: String, enum: ["AC", "Non-AC"], required: true },
    rent: { type: Number, required: true },
    facilities: [{ type: String }],
  },
  { timestamps: true }
);

export const Room = mongoose.model("Room", roomSchema);
