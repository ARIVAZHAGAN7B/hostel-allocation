import express from "express";
import { Student } from "../models/Student.js";
import { RoommateRequest } from "../models/RoommateRequest.js";

const router = express.Router();

function calculateCompatibility(s1, s2) {
  let score = 50;
  if (s1.department === s2.department) score += 15;
  if (s1.hometown === s2.hometown) score += 10;
  if (s1.language === s2.language) score += 10;
  if (s1.traits?.food === s2.traits?.food) score += 5;
  if (s1.traits?.sleep === s2.traits?.sleep) score += 5;

  const sharedInterests = s1.interests?.filter(i => s2.interests?.includes(i)) || [];
  score += sharedInterests.length * 2.5;

  return Math.min(99, Math.max(55, Math.round(score)));
}

// GET recommended roommate matches
router.get("/matches", async (req, res) => {
  try {
    const { regNo, gender, department, search } = req.query;

    const currentStudent = regNo
      ? await Student.findOne({ regNo })
      : await Student.findOne({ regNo: "7376242AD142" });

    const filter = { regNo: { $ne: currentStudent ? currentStudent.regNo : "" } };
    if (gender) filter.gender = gender;
    else if (currentStudent) filter.gender = currentStudent.gender;

    if (department && department !== "All") filter.department = department;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { regNo: { $regex: search, $options: "i" } },
        { hometown: { $regex: search, $options: "i" } },
      ];
    }

    const students = await Student.find(filter).limit(100).select("-password");

    const existingRequests = await RoommateRequest.find({
      $or: [
        { requesterRegNo: currentStudent?.regNo || "" },
        { targetRegNo: currentStudent?.regNo || "" },
      ],
    });

    const requestMap = new Map();
    existingRequests.forEach((req) => {
      const otherReg = req.requesterRegNo === currentStudent?.regNo ? req.targetRegNo : req.requesterRegNo;
      requestMap.set(otherReg, req.status);
    });

    const matches = students.map((s, idx) => {
      const compatibility = currentStudent
        ? calculateCompatibility(currentStudent, s)
        : 60 + ((idx * 7) % 39);

      return {
        ...s.toObject(),
        matchId: `M${String(idx + 1).padStart(3, "0")}`,
        compatibility,
        status: requestMap.get(s.regNo) || "Suggested",
      };
    }).sort((a, b) => b.compatibility - a.compatibility);

    res.json(matches);
  } catch (error) {
    console.error("Roommate Matches Error:", error);
    res.status(500).json({ error: "Failed to fetch roommate recommendations." });
  }
});

// POST send or update roommate request
router.post("/request", async (req, res) => {
  try {
    const { requesterRegNo, targetRegNo, status } = req.body;

    if (!requesterRegNo || !targetRegNo) {
      return res.status(400).json({ error: "Requester and target registration numbers are required." });
    }

    let request = await RoommateRequest.findOne({
      $or: [
        { requesterRegNo, targetRegNo },
        { requesterRegNo: targetRegNo, targetRegNo: requesterRegNo },
      ],
    });

    if (request) {
      request.status = status || "Requested";
      await request.save();
    } else {
      const count = await RoommateRequest.countDocuments();
      request = new RoommateRequest({
        matchId: `M${String(count + 1).padStart(3, "0")}`,
        requesterRegNo,
        targetRegNo,
        compatibility: 85,
        status: status || "Requested",
      });
      await request.save();
    }

    res.json({ message: "Roommate request updated successfully", request });
  } catch (error) {
    console.error("Roommate Request Error:", error);
    res.status(500).json({ error: "Failed to process roommate request." });
  }
});

export default router;
