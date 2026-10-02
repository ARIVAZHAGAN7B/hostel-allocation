import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    regNo: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    department: { type: String, required: true },
    dept: { type: String, required: true },
    year: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female"], required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String },
    hometown: { type: String },
    language: { type: String },
    interests: [{ type: String }],
    hostel: { type: String, default: null },
    room: { type: String, default: null },
    cgpa: { type: String },
    avatar: { type: String },
    compatibility: { type: Number, default: 85 },
    role: { type: String, enum: ["student", "warden", "admin"], default: "student" },
    traits: {
      sleep: { type: String, default: "10 PM – 12 AM" },
      cleanliness: { type: Number, default: 4 },
      food: { type: String, default: "Non-Veg" },
      personality: { type: String, default: "Ambivert" },
      noise: { type: String, default: "Moderate" },
    },
  },
  { timestamps: true }
);

export const Student = mongoose.model("Student", studentSchema);
