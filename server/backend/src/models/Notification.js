import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: String, required: true },
    read: { type: Boolean, default: false },
    regNo: { type: String, default: null },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
