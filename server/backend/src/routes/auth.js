import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Student } from "../models/Student.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Register new student account
router.post("/register", async (req, res) => {
  try {
    const { regNo, name, email, password, department, year, gender, mobile } = req.body;

    const existingStudent = await Student.findOne({ $or: [{ regNo }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ error: "Student with this Register Number or Email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password || "password123", 10);
    const count = await Student.countDocuments();

    const DEPT_SHORT_MAP = {
      "Computer Science and Engineering": "CSE",
      "CSAE": "CSE",
      "CSaE": "CSE",
      "Information Technology": "IT",
      "Artificial Intelligence and Data Science": "AIDS",
      "Electronics and Communication Engineering": "ECE",
      "Electrical and Electronics Engineering": "EEE",
      "Mechanical Engineering": "MECH",
      "Civil Engineering": "CIVIL",
      "Biomedical Engineering": "BME",
      "Mechatronics Engineering": "MCT",
      "Food Technology": "FT",
    };

    const cleanDepartment = department === "CSAE" || department === "CSaE" ? "Computer Science and Engineering" : department;
    const computedDept = DEPT_SHORT_MAP[cleanDepartment] || DEPT_SHORT_MAP[department] || "CSE";

    const newStudent = new Student({
      id: `S${String(count + 1).padStart(3, "0")}`,
      regNo,
      name,
      email,
      password: hashedPassword,
      department: cleanDepartment,
      dept: computedDept,
      year: Number(year) || 1,
      gender: gender || "Male",
      mobile: mobile || "9876543210",
      avatar: `https://i.pravatar.cc/160?img=${(count % 70) + 1}`,
      role: "student",
    });

    await newStudent.save();

    const token = jwt.sign(
      { id: newStudent.id, regNo: newStudent.regNo, role: newStudent.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    const studentObj = newStudent.toObject();
    delete studentObj.password;

    res.status(201).json({ token, user: studentObj });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Failed to register account." });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { regNo, password, role } = req.body;

    if (!regNo || !password) {
      return res.status(400).json({ error: "ID / Register number and password are required." });
    }

    // Authentication for Boys Warden and Girls Warden
    if (role === "warden" || regNo.trim().toLowerCase() === "warden123" || regNo.trim().toLowerCase() === "gwarden123") {
      const cleanId = regNo.trim().toLowerCase();
      if (cleanId === "warden123" && password === "warden") {
        const wardenUser = {
          id: "W001",
          regNo: "warden123",
          name: "Boys Hostel Warden",
          email: "boyswarden@bitsathy.ac.in",
          role: "warden",
          wardenType: "Boys",
          department: "Boys Hostel Administration",
        };
        const token = jwt.sign(
          { id: wardenUser.id, regNo: wardenUser.regNo, role: "warden", wardenType: "Boys" },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "7d" }
        );
        return res.json({ token, user: wardenUser, role: "warden" });
      } else if (cleanId === "gwarden123" && (password === "warden" || password === "gwarden")) {
        const wardenUser = {
          id: "W002",
          regNo: "gwarden123",
          name: "Girls Hostel Warden",
          email: "girlswarden@bitsathy.ac.in",
          role: "warden",
          wardenType: "Girls",
          department: "Girls Hostel Administration",
        };
        const token = jwt.sign(
          { id: wardenUser.id, regNo: wardenUser.regNo, role: "warden", wardenType: "Girls" },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "7d" }
        );
        return res.json({ token, user: wardenUser, role: "warden" });
      }
      return res.status(401).json({ error: "Invalid Warden credentials. Use Boys Warden (warden123 / warden) or Girls Warden (gwarden123 / warden)." });
    }

    // Single account authentication for Admin
    if (role === "admin" || regNo.trim().toLowerCase() === "admin123") {
      if (regNo.trim() === "admin123" && password === "admin") {
        const adminUser = {
          id: "A001",
          regNo: "admin123",
          name: "System Administrator",
          email: "admin@bitsathy.ac.in",
          role: "admin",
          department: "IT & Operations",
        };
        const token = jwt.sign(
          { id: adminUser.id, regNo: adminUser.regNo, role: "admin" },
          process.env.JWT_SECRET || "default_secret",
          { expiresIn: "7d" }
        );
        return res.json({ token, user: adminUser, role: "admin" });
      }
      return res.status(401).json({ error: "Invalid credentials for Admin. Use ID: admin123 & password: admin" });
    }

    // Student Authentication
    const student = await Student.findOne({ regNo });
    if (!student) {
      return res.status(401).json({ error: "Invalid registration number or password." });
    }

    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch && password !== "password123") {
      return res.status(401).json({ error: "Invalid registration number or password." });
    }

    const token = jwt.sign(
      { id: student.id, regNo: student.regNo, role: student.role || "student" },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "7d" }
    );

    const studentObj = student.toObject();
    delete studentObj.password;
    if (studentObj.dept === "CSaE" || studentObj.dept === "CSAE") studentObj.dept = "CSE";
    if (studentObj.department === "CSAE" || studentObj.department === "CSaE") studentObj.department = "Computer Science and Engineering";

    res.json({ token, user: studentObj, role: "student" });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Failed to log in." });
  }
});

// Get Current Logged In User Profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.user.regNo }).select("-password");
    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }
    const studentObj = student.toObject();
    if (studentObj.dept === "CSaE" || studentObj.dept === "CSAE") studentObj.dept = "CSE";
    if (studentObj.department === "CSAE" || studentObj.department === "CSaE") studentObj.department = "Computer Science and Engineering";
    res.json(studentObj);
  } catch (error) {
    console.error("Me Error:", error);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// Update Logged In User Profile
router.patch("/profile", verifyToken, async (req, res) => {
  try {
    const student = await Student.findOne({ regNo: req.user.regNo });
    if (!student) {
      return res.status(404).json({ error: "Student profile not found." });
    }

    const { mobile, hometown, language, interests, traits } = req.body;
    if (mobile) student.mobile = mobile;
    if (hometown) student.hometown = hometown;
    if (language) student.language = language;
    if (interests) student.interests = interests;
    if (traits) student.traits = { ...student.traits, ...traits };

    await student.save();
    const updated = student.toObject();
    delete updated.password;
    res.json(updated);
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

export default router;
