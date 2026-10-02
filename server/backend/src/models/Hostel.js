import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ["Boys", "Girls"], required: true },
    floors: { type: Number, required: true },
    totalRooms: { type: Number, required: true },
    capacity: { type: Number, required: true },
    occupied: { type: Number, required: true, default: 0 },
    warden: { type: String, required: true },
    facilities: [{ type: String }],
    image: { type: String },
  },
  { timestamps: true }
);

export const Hostel = mongoose.model("Hostel", hostelSchema);
