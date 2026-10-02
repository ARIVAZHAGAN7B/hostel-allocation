import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { Hostel } from "./models/Hostel.js";
import { Room } from "./models/Room.js";
import { Student } from "./models/Student.js";
import { Complaint } from "./models/Complaint.js";
import { Notification } from "./models/Notification.js";
import { Attendance } from "./models/Attendance.js";
import { Payment } from "./models/Payment.js";
import { RoommateRequest } from "./models/RoommateRequest.js";
import { Application } from "./models/Application.js";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bit_roomie_connect";

function mulberry32(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260731);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const int = (min, max) => min + Math.floor(rand() * (max - min + 1));

const FIRST_M = [
  "Gowtham", "Karthik", "Surya", "Vignesh", "Hariharan", "Dinesh", "Mohan", "Bala",
  "Praveen", "Sanjay", "Rohit", "Naveen", "Manoj", "Ashwin", "Gokul", "Rahul",
  "Sathish", "Vimal", "Yuvaraj", "Aditya", "Nithin", "Prem", "Kavin", "Jeevan",
];
const FIRST_F = [
  "Anitha", "Divya", "Keerthana", "Meenakshi", "Nandhini", "Priya", "Sowmya", "Swetha",
  "Vaishnavi", "Yamini", "Harini", "Janani", "Lakshmi", "Deepika", "Aishwarya", "Ramya",
  "Kavya", "Sneha", "Pooja", "Tharani", "Monika", "Abinaya", "Charumathi", "Ishwarya",
];
const LAST = [
  "Kumar", "Raj", "Subramanian", "Venkatesh", "Ramesh", "Natarajan", "Sundaram", "Krishnan",
  "Murugan", "Palanisamy", "Chandrasekar", "Balaji", "Ganesan", "Iyer", "Sekar", "Arumugam",
  "Perumal", "Devaraj", "Anand", "Selvam",
];

const DEPARTMENTS = [
  "Computer Science and Engineering",
  "Information Technology",
  "Artificial Intelligence and Data Science",
  "Electronics and Communication Engineering",
  "Electrical and Electronics Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Biomedical Engineering",
  "Mechatronics Engineering",
  "Food Technology",
];

const DEPT_SHORT = {
  "Computer Science and Engineering": "CSE",
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

const HOMETOWNS = [
  "Erode", "Coimbatore", "Salem", "Madurai", "Trichy", "Chennai", "Tirupur", "Namakkal",
  "Karur", "Dindigul", "Thanjavur", "Vellore", "Sivakasi", "Nagercoil", "Hosur", "Ooty",
];
const LANGUAGES = ["Tamil", "English", "Telugu", "Malayalam", "Kannada", "Hindi"];
const INTERESTS = [
  "Cricket", "Football", "Coding", "Gaming", "Music", "Photography", "Reading", "Chess",
  "Gym", "Cycling", "Drawing", "Robotics", "Trekking", "Movies", "Badminton", "Cooking",
];

const HOSTEL_NAMES = [
  ["Sapphire Block", "Boys"],
  ["Emerald Block", "Boys"],
  ["Ruby Block", "Boys"],
  ["Diamond Block", "Boys"],
  ["Coral Block", "Boys"],
  ["Pearl Block", "Boys"],
  ["Ganga Block", "Girls"],
  ["Yamuna Block", "Girls"],
  ["Narmadha Block", "Girls"],
  ["Cauvery Block", "Girls"],
  ["North Bhavani Block", "Girls"],
  ["South Bhavani Block", "Girls"],
  ["Old Bhavani Block", "Girls"],
];

const dateStr = (daysAgo) => new Date(2026, 6, 31 - daysAgo).toISOString().slice(0, 10);

async function seed() {
  console.log("Connecting to MongoDB Atlas...");
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB successfully!");

  console.log("Clearing existing data...");
  await Promise.all([
    Hostel.deleteMany({}),
    Room.deleteMany({}),
    Student.deleteMany({}),
    Complaint.deleteMany({}),
    Notification.deleteMany({}),
    Attendance.deleteMany({}),
    Payment.deleteMany({}),
    RoommateRequest.deleteMany({}),
    Application.deleteMany({}),
  ]);

  console.log("Seeding Hostels...");
  const hostelsData = HOSTEL_NAMES.map(([name, type], i) => {
    const floors = int(3, 6);
    const totalRooms = int(20, 32);
    const blockFacilities = ["Wi-Fi", "Study Table", "Hot Water", "Gym", "Laundry", "RO Water", "CCTV", "Power Backup", "Mess", "Sports Court"];
    if (name.includes("Coral")) {
      blockFacilities.push("AC", "Attached Bathroom");
    }
    const avgCap = (name.includes("Sapphire") || name.includes("Emerald") || name.includes("Pearl")) ? 4 : name.includes("Coral") ? 1.5 : name.includes("Ruby") ? 3 : name.includes("Diamond") ? 2.3 : 3;
    const capacity = Math.round(totalRooms * avgCap);
    return {
      id: `H${String(i + 1).padStart(2, "0")}`,
      name,
      type,
      floors,
      totalRooms,
      capacity,
      occupied: Math.floor(capacity * (0.55 + rand() * 0.4)),
      warden: `${pick(type === "Boys" ? FIRST_M : FIRST_F)} ${pick(LAST)}`,
      facilities: blockFacilities,
      image: "https://www.bitsathy.ac.in/wp-content/uploads/2022/09/gentshostel.jpg",
    };
  });
  await Hostel.insertMany(hostelsData);

  console.log("Seeding Rooms...");
  const roomsData = [];
  let n = 0;
  while (roomsData.length < 250) {
    const h = hostelsData[n % hostelsData.length];
    const floor = int(0, h.floors - 1);
    let capacity;
    let roomType = "Non-AC";
    let hasAttachedBathroom = false;
    if (h.name.includes("Sapphire") || h.name.includes("Emerald") || h.name.includes("Pearl")) {
      capacity = 4;
      roomType = "Non-AC";
    } else if (h.name.includes("Ruby")) {
      capacity = pick([2, 4]);
      roomType = "Non-AC";
    } else if (h.name.includes("Coral")) {
      capacity = pick([1, 2]);
      roomType = "AC";
      hasAttachedBathroom = true;
    } else if (h.name.includes("Diamond")) {
      capacity = pick([1, 2, 4]);
      roomType = "Non-AC";
    } else {
      capacity = pick([2, 3, 4]);
      roomType = "Non-AC";
    }
    const roomFacilities = ["Wi-Fi", "Study Table", "Hot Water"];
    if (hasAttachedBathroom) roomFacilities.push("Attached Bathroom");
    if (roomType === "AC") roomFacilities.push("AC");

    const rent = roomType === "AC"
      ? (capacity === 1 ? 110000 : 95000)
      : (capacity === 1 ? 78000 : capacity === 2 ? 64000 : capacity === 3 ? 56000 : 48000);

    roomsData.push({
      id: `R${String(roomsData.length + 1).padStart(3, "0")}`,
      hostelId: h.id,
      hostelName: h.name,
      number: `${floor === 0 ? "G" : floor}${String(int(1, 40)).padStart(2, "0")}`,
      floor,
      capacity,
      occupied: int(0, capacity),
      type: roomType,
      rent,
      facilities: roomFacilities,
    });
    n++;
  }
  await Room.insertMany(roomsData);

  console.log("Seeding Students...");
  const defaultPasswordHash = await bcrypt.hash("password123", 10);
  const studentsData = Array.from({ length: 500 }, (_, i) => {
    const gender = rand() > 0.45 ? "Male" : "Female";
    const name = i === 0 ? "Gowtham Kumar" : `${pick(gender === "Male" ? FIRST_M : FIRST_F)} ${pick(LAST)}`;
    const department = pick(DEPARTMENTS);
    const year = i === 0 ? 3 : pick([1, 2, 3, 4]);
    const batch = 2026 - year;
    const regNo = i === 0 ? "7376242AD142" : `${batch}${String(int(100, 999))}${String(i).padStart(3, "0")}`;
    const hostel = pick(hostelsData.filter((h) => h.type === (gender === "Male" ? "Boys" : "Girls")));
    const allocated = rand() > 0.18;

    return {
      id: `S${String(i + 1).padStart(3, "0")}`,
      regNo,
      name,
      password: defaultPasswordHash,
      department,
      dept: DEPT_SHORT[department],
      year,
      gender,
      email: i === 0 ? "gowtham.aids@bitsathy.ac.in" : `${name.split(" ")[0].toLowerCase()}.${DEPT_SHORT[department].toLowerCase()}${year}${i}@bitsathy.ac.in`,
      mobile: `9${int(100000000, 899999999)}`,
      hometown: pick(HOMETOWNS),
      language: pick(LANGUAGES),
      interests: [...INTERESTS].sort(() => rand() - 0.5).slice(0, 4),
      hostel: allocated ? hostel.name : null,
      room: allocated ? `${int(1, 5)}${String(int(1, 40)).padStart(2, "0")}` : null,
      cgpa: (6.5 + rand() * 3.4).toFixed(2),
      avatar: `https://i.pravatar.cc/160?img=${(i % 70) + 1}`,
      compatibility: int(58, 98),
      role: "student",
      traits: {
        sleep: pick(["Before 10 PM", "10 PM – 12 AM", "After Midnight"]),
        cleanliness: int(2, 5),
        food: rand() > 0.45 ? "Veg" : "Non-Veg",
        personality: pick(["Introvert", "Extrovert", "Ambivert"]),
        noise: pick(["Silent", "Moderate", "Lively"]),
      },
    };
  });
  await Student.insertMany(studentsData);

  console.log("Seeding Complaints...");
  const COMPLAINT_TITLES = {
    Electricity: ["Tube light not working", "Fan making noise", "Power socket sparking"],
    Water: ["No hot water in morning", "Tap leakage", "Low water pressure"],
    Internet: ["Wi-Fi very slow", "No signal on 3rd floor", "Frequent disconnection"],
    Furniture: ["Broken study chair", "Cot bolt loose", "Cupboard door damaged"],
    Cleaning: ["Corridor not cleaned", "Washroom cleaning required", "Dustbin overflowing"],
    Others: ["Mess food quality", "Lost ID card", "Noise after lights off"],
  };
  const CATEGORIES = Object.keys(COMPLAINT_TITLES);
  const complaintsData = Array.from({ length: 100 }, (_, i) => {
    const s = studentsData[int(0, 499)];
    const category = pick(CATEGORIES);
    return {
      id: `C${String(i + 1).padStart(3, "0")}`,
      student: s.name,
      regNo: s.regNo,
      category,
      title: pick(COMPLAINT_TITLES[category]),
      hostel: s.hostel ?? hostelsData[0].name,
      room: s.room ?? "212",
      priority: pick(["Low", "Medium", "High"]),
      status: pick(["Pending", "In Progress", "Resolved", "Resolved"]),
      createdAt: dateStr(int(0, 60)),
      assignedTo: pick(["Maintenance Team", "Housekeeping", "IT Support", "Electrician"]),
    };
  });
  await Complaint.insertMany(complaintsData);

  console.log("Seeding Notifications...");
  const notificationsData = Array.from({ length: 100 }, (_, i) => {
    const category = pick(["Academic", "Hostel", "Mess", "Payment", "Event"]);
    const bodies = {
      Academic: ["Semester exam timetable published on the student portal.", "Internal assessment marks are now available."],
      Hostel: ["Room inspection scheduled this weekend across all blocks.", "Water supply maintenance from 10 AM to 1 PM."],
      Mess: ["Special dinner menu announced for the weekend.", "Mess bill for the month has been finalised."],
      Payment: ["Hostel fee second instalment due next week.", "Payment receipt generated for your last transaction."],
      Event: ["Inter-hostel cricket tournament registrations are open.", "Cultural night at the open-air auditorium."],
    };
    return {
      id: `N${String(i + 1).padStart(3, "0")}`,
      title: `${category} update #${i + 1}`,
      body: pick(bodies[category]),
      category,
      date: dateStr(int(0, 90)),
      read: rand() > 0.45,
    };
  });
  await Notification.insertMany(notificationsData);

  console.log("Seeding Attendance...");
  const attendanceData = Array.from({ length: 200 }, (_, i) => {
    const r = rand();
    return {
      id: `A${String(i + 1).padStart(3, "0")}`,
      date: dateStr(i % 120),
      status: r > 0.16 ? "Present" : r > 0.07 ? "Absent" : "Leave",
      regNo: studentsData[i % 500].regNo,
    };
  });
  await Attendance.insertMany(attendanceData);

  console.log("Seeding Payments...");
  const paymentsData = Array.from({ length: 200 }, (_, i) => {
    const s = studentsData[i % 500];
    const amount = pick([52000, 64000, 78000]);
    const state = pick(["Paid", "Paid", "Pending", "Partial"]);
    return {
      id: `P${String(i + 1).padStart(3, "0")}`,
      student: s.name,
      regNo: s.regNo,
      term: pick(["2026 Term I", "2026 Term II", "2025 Term II"]),
      amount,
      paid: state === "Paid" ? amount : state === "Partial" ? Math.round(amount / 2) : 0,
      status: state,
      date: dateStr(int(0, 180)),
      mode: pick(["UPI", "Net Banking", "Card", "DD"]),
    };
  });
  await Payment.insertMany(paymentsData);

  console.log("Seeding finished successfully!");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
