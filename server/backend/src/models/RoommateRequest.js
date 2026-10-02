import mongoose from "mongoose";

const roommateRequestSchema = new mongoose.Schema(
  {
    matchId: { type: String, required: true, unique: true },
    requesterRegNo: { type: String, required: true },
    targetRegNo: { type: String, required: true },
    compatibility: { type: Number, required: true },
    status: { type: String, enum: ["Suggested", "Requested", "Accepted", "Rejected"], default: "Suggested" },
  },
  { timestamps: true }
);

export const RoommateRequest = mongoose.model("RoommateRequest", roommateRequestSchema);
