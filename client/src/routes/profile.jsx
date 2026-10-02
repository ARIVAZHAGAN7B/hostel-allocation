import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  useCurrentUser,
  useUpdateProfile,
  useApplications,
  useComplaints,
  useRoomChangeRequests,
} from "@/hooks/use-hostel-api";
import {
  Activity,
  Award,
  Building2,
  CheckCircle2,
  Key,
  Phone,
  Shield,
  UserCheck,
} from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "User Profile · BIT Hostel Portal" },
      {
        name: "description",
        content: "Account, personal and administrative profile details for BIT hostel users.",
      },
      { property: "og:title", content: "User Profile · BIT Hostel Portal" },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const currentStudent = user || {};

  const isAdmin = currentStudent.role === "admin" || currentStudent.regNo === "admin123";
  const isWarden =
    currentStudent.role === "warden" ||
    currentStudent.regNo === "warden123" ||
    currentStudent.regNo === "gwarden123";

  if (isAdmin) {
    return <AdminProfile user={currentStudent} />;
  }
  if (isWarden) {
    return <WardenProfile user={currentStudent} />;
  }

  return <StudentProfile user={currentStudent} />;
}

// ==========================================
// 👨‍💼 WARDEN PROFILE COMPONENT
// ==========================================
function WardenProfile({ user }) {
  const isGirlsWarden = user.wardenType === "Girls" || user.regNo === "gwarden123";
  const wardenType = isGirlsWarden ? "Girls" : "Boys";
  const empId = user.regNo === "gwarden123" ? "BIT-W002" : "BIT-W001";
  const name = user.name || (isGirlsWarden ? "Mrs. S. Meenakshi" : "Mr. K. Kumar");
  const email = user.email || (isGirlsWarden ? "girlswarden@bitsathy.ac.in" : "boyswarden@bitsathy.ac.in");

  const { data: appsData = [] } = useApplications();
  const { data: complaintsData = [] } = useComplaints();
  const { data: roomChangeData = [] } = useRoomChangeRequests();

  const pendingApps = Array.isArray(appsData) ? appsData.filter((a) => a.status === "Pending").length : 5;
  const pendingRc = Array.isArray(roomChangeData) ? roomChangeData.filter((r) => r.status === "Pending").length : 3;
  const openComplaints = Array.isArray(complaintsData) ? complaintsData.filter((c) => c.status !== "Resolved").length : 12;

  const wardenResponsibilities = [
    "Student Management",
    "Room Allocation",
    "Complaint Management",
    "Room Inspection",
    "Room Change Requests",
    "Student Attendance Monitoring",
    "Hostel Announcements",
  ];

  return (
    <AppShell
      title={`Warden Profile · ${wardenType} Hostel`}
      breadcrumb={["Profile"]}
      actions={
        <Button variant="outline" onClick={() => toast.success("Password reset link sent to registered email")}>
          <Key className="mr-2 size-4" /> Change password
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        {/* Left Side: Avatar & Core Information */}
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <img
              src={isGirlsWarden ? "https://i.pravatar.cc/160?img=47" : "https://i.pravatar.cc/160?img=68"}
              alt={name}
              className="mx-auto size-28 rounded-3xl object-cover ring-4 ring-primary/20"
            />
            <h2 className="font-display mt-4 text-xl font-bold">{name}</h2>
            <p className="text-sm font-semibold text-primary">{empId}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="hero">Hostel Warden</Badge>
              <Badge variant="secondary">{wardenType} Hostel</Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Department: Hostel Administration</p>
          </section>

          {/* Contact Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Phone className="size-4 text-primary" /> 5. Contact Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Official Email:</span>
                <span className="font-semibold text-foreground">{email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Office Phone:</span>
                <span className="font-semibold text-foreground">+91 4295 226001</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Emergency Contact:</span>
                <span className="font-semibold text-foreground">+91 94432 11990</span>
              </div>
              <div className="flex items-start justify-between gap-2">
                <span className="text-muted-foreground shrink-0">Hostel Office Location:</span>
                <span className="font-semibold text-foreground text-right">
                  {isGirlsWarden ? "Girls Hostel Admin Block, Ground Floor" : "Boys Hostel Main Gate Office, Ground Floor"}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Side: Detailed Sections */}
        <div className="space-y-5">
          {/* 1. Profile Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <UserCheck className="size-4 text-primary" /> 1. Profile Information
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="font-semibold">{name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Employee ID</dt>
                <dd className="font-semibold">{empId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Designation</dt>
                <dd className="font-semibold">Hostel Warden</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Gender</dt>
                <dd className="font-semibold">{isGirlsWarden ? "Female" : "Male"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Department</dt>
                <dd className="font-semibold">Hostel Administration</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Date of Joining</dt>
                <dd className="font-semibold">15 August 2021</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-semibold">{email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone Number</dt>
                <dd className="font-semibold">+91 98421 88392</dd>
              </div>
            </dl>
          </section>

          {/* 2. Hostel Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Building2 className="size-4 text-primary" /> 2. Hostel Information
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Assigned Hostel Block</dt>
                <dd className="font-semibold">
                  {isGirlsWarden
                    ? "Ganga, Yamuna, Narmadha, Cauvery, North & South Bhavani"
                    : "Sapphire, Emerald, Ruby, Diamond, Coral, Pearl"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Hostel Type</dt>
                <dd className="font-semibold">{wardenType} Hostels</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Number of Rooms Under Management</dt>
                <dd className="font-semibold">{isGirlsWarden ? "180" : "180"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Total Students</dt>
                <dd className="font-semibold">{isGirlsWarden ? "650" : "650"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Occupied Rooms</dt>
                <dd className="font-semibold text-accent">{isGirlsWarden ? "158" : "158"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Available Rooms</dt>
                <dd className="font-semibold text-primary">{isGirlsWarden ? "22" : "22"}</dd>
              </div>
            </dl>
          </section>

          {/* 3. Responsibilities */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Award className="size-4 text-primary" /> 3. Responsibilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {wardenResponsibilities.map((resp) => (
                <Badge key={resp} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                  <CheckCircle2 className="mr-1.5 size-3.5 text-accent" /> {resp}
                </Badge>
              ))}
            </div>
          </section>

          {/* 4. Warden Dashboard Statistics */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Activity className="size-4 text-primary" /> 4. Warden Dashboard Statistics
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-center">
              <StatBox label="Students" value={isGirlsWarden ? "650" : "650"} />
              <StatBox label="Rooms" value={isGirlsWarden ? "180" : "180"} />
              <StatBox label="Occupied" value={isGirlsWarden ? "158" : "158"} tone="text-accent" />
              <StatBox label="Available" value={isGirlsWarden ? "22" : "22"} tone="text-primary" />
              <StatBox label="Complaints" value={openComplaints} tone="text-amber-500" />
              <StatBox label="Pending Requests" value={pendingApps + pendingRc} tone="text-blue-500" />
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// 👨‍💻 ADMIN PROFILE COMPONENT
// ==========================================
function AdminProfile({ user }) {
  const adminId = "BIT-ADM001";
  const name = user.name || "Mr. R. Arun";
  const email = user.email || "admin@bitsathy.ac.in";

  const { data: appsData = [] } = useApplications();
  const { data: complaintsData = [] } = useComplaints();

  const pendingApps = Array.isArray(appsData) ? appsData.filter((a) => a.status === "Pending").length : 85;
  const openComplaints = Array.isArray(complaintsData) ? complaintsData.filter((c) => c.status !== "Resolved").length : 24;

  const adminResponsibilities = [
    "Student Management",
    "Warden Management",
    "Hostel Management",
    "Room Management",
    "Room Allocation",
    "Roommate Matching Management",
    "Complaint Management",
    "Notification Management",
    "Reports",
    "System Settings",
  ];

  return (
    <AppShell
      title="System Administrator Profile"
      breadcrumb={["Profile"]}
      actions={
        <Button variant="outline" onClick={() => toast.success("Password change link sent to admin email")}>
          <Key className="mr-2 size-4" /> Change password
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        {/* Left Side: Avatar & Security Info */}
        <div className="space-y-5">
          <section className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <img
              src="https://i.pravatar.cc/160?img=60"
              alt={name}
              className="mx-auto size-28 rounded-3xl object-cover ring-4 ring-primary/20"
            />
            <h2 className="font-display mt-4 text-xl font-bold">{name}</h2>
            <p className="text-sm font-semibold text-primary">{adminId}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <Badge variant="hero">Hostel Administrator</Badge>
              <Badge variant="secondary">Department: Administration</Badge>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Email: {email}</p>
            <p className="text-xs text-muted-foreground">Phone: +91 98765 43210</p>
          </section>

          {/* 4. Security Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2">
              <Shield className="size-4 text-primary" /> 4. Security Information
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Account Status:</span>
                <Badge variant="success" className="px-2 py-0.5 text-[11px]">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Last Login:</span>
                <span className="font-semibold text-foreground">Today, 09:15 AM</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Login History:</span>
                <span className="font-semibold text-foreground">BIT Internal (192.168.1.45)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Active Sessions:</span>
                <span className="font-semibold text-foreground">1 Active (Chrome / Win)</span>
              </div>
            </div>
            <Button
              variant="soft"
              className="mt-2 w-full text-xs"
              onClick={() => toast.success("Password reset triggered")}
            >
              Change Password
            </Button>
          </section>
        </div>

        {/* Right Side: Detailed Admin Information */}
        <div className="space-y-5">
          {/* 1. Profile Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <UserCheck className="size-4 text-primary" /> 1. Profile Information
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted-foreground">Full Name</dt>
                <dd className="font-semibold">{name}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Admin ID</dt>
                <dd className="font-semibold">{adminId}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Designation</dt>
                <dd className="font-semibold">Hostel Administrator</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Department</dt>
                <dd className="font-semibold">Administration</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Email</dt>
                <dd className="font-semibold">{email}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Phone Number</dt>
                <dd className="font-semibold">+91 98765 43210</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Last Login</dt>
                <dd className="font-semibold">Today, 09:15 AM</dd>
              </div>
            </dl>
          </section>

          {/* 2. System Information */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Building2 className="size-4 text-primary" /> 2. System Information
            </h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <StatBox label="Total Students" value="5000+" tone="text-primary" />
              <StatBox label="Total Hostels" value="13" />
              <StatBox label="Total Rooms" value="1500+" />
              <StatBox label="Occupied Rooms" value="1200+" tone="text-accent" />
              <StatBox label="Available Rooms" value="300+" tone="text-blue-500" />
              <StatBox label="Pending Applications" value={pendingApps} tone="text-amber-500" />
              <StatBox label="Pending Complaints" value={openComplaints} tone="text-red-500" />
              <StatBox label="Roommate Requests" value="42" tone="text-purple-500" />
            </div>
          </section>

          {/* 3. Administrative Responsibilities */}
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
              <Shield className="size-4 text-primary" /> 3. Administrative Responsibilities
            </h3>
            <div className="flex flex-wrap gap-2">
              {adminResponsibilities.map((resp) => (
                <Badge key={resp} variant="secondary" className="px-3 py-1.5 text-xs font-medium">
                  <CheckCircle2 className="mr-1.5 size-3.5 text-primary" /> {resp}
                </Badge>
              ))}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}

// ==========================================
// 🎓 STUDENT PROFILE COMPONENT
// ==========================================
function StudentProfile({ user: currentStudent }) {
  const updateProfileMutation = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [mobile, setMobile] = useState("");
  const [hometown, setHometown] = useState("");
  const [language, setLanguage] = useState("");
  const [interests, setInterests] = useState("");

  const handleStartEdit = () => {
    setMobile(currentStudent.mobile || "9876543210");
    setHometown(currentStudent.hometown || "Coimbatore");
    setLanguage(currentStudent.language || "Tamil");
    setInterests(
      Array.isArray(currentStudent.interests)
        ? currentStudent.interests.join(", ")
        : "Coding, Cricket, Gaming",
    );
    setIsEditing(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        mobile,
        hometown,
        language,
        interests: interests.split(",").map((i) => i.trim()).filter(Boolean),
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Update Failed", { description: res.error });
          } else {
            toast.success("Profile Updated Successfully", {
              description: "Your changes have been saved to MongoDB Atlas.",
            });
            setIsEditing(false);
          }
        },
        onError: (err) => {
          toast.error("Profile Error", { description: err.message });
        },
      },
    );
  };

  return (
    <AppShell
      title="My profile"
      breadcrumb={["Profile"]}
      actions={
        <>
          <Button variant="outline" onClick={() => toast("Password reset link sent to registered email")}>
            Change password
          </Button>
          {!isEditing ? (
            <Button variant="hero" onClick={handleStartEdit}>
              Edit profile
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel editing
            </Button>
          )}
        </>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_2fr]">
        <section className="rounded-2xl border bg-card p-6 text-center shadow-soft">
          <img
            src={currentStudent.avatar || "https://i.pravatar.cc/160?img=12"}
            alt={currentStudent.name || "Student"}
            className="mx-auto size-28 rounded-3xl object-cover"
          />
          <h2 className="font-display mt-4 text-xl font-bold">
            {currentStudent.name || "Student"}
          </h2>
          <p className="text-sm text-muted-foreground">{currentStudent.regNo || "—"}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge>{(currentStudent.dept || currentStudent.department || "CSE").replace(/CSa?E/gi, "CSE")}</Badge>
            <Badge variant="secondary">Year {currentStudent.year || 1}</Badge>
            <Badge variant="outline">{currentStudent.hostel || "Not Allocated"}</Badge>
          </div>
        </section>

        <div className="space-y-5">
          {isEditing ? (
            <form onSubmit={handleSaveProfile} className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
              <h3 className="text-lg font-bold">Edit Profile Information</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Mobile Number</Label>
                  <Input
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hometown</Label>
                  <Input
                    value={hometown}
                    onChange={(e) => setHometown(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Primary Language</Label>
                  <Input
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hobbies / Interests (comma separated)</Label>
                  <Input
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button type="submit" variant="hero" disabled={updateProfileMutation.isPending}>
                  {updateProfileMutation.isPending ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            [
              [
                "Personal information",
                [
                  ["Email", currentStudent.email || "—"],
                  ["Mobile", currentStudent.mobile || "9876543210"],
                  ["Gender", currentStudent.gender || "Male"],
                  ["Hometown", currentStudent.hometown || "Coimbatore"],
                ],
              ],
              [
                "Academic information",
                [
                  ["Department", (currentStudent.department || currentStudent.dept || "CSE").replace(/CSa?E/gi, "CSE")],
                  ["Year", `Year ${currentStudent.year || 1}`],
                  ["CGPA", currentStudent.cgpa || "8.50"],
                  ["Language", currentStudent.language || "Tamil"],
                ],
              ],
              [
                "Hostel information",
                [
                  ["Block", currentStudent.hostel ?? "Not Allocated"],
                  ["Room", currentStudent.room ?? "—"],
                  ["Mess plan", "Vegetarian"],
                  ["Fee status", "Term I Paid"],
                ],
              ],
              [
                "Guardian details",
                [
                  ["Name", "Subramanian R"],
                  ["Relation", "Father"],
                  ["Mobile", "9843112233"],
                  ["Occupation", "Agriculturist"],
                ],
              ],
            ].map(([title, rows]) => (
              <section key={title} className="rounded-2xl border bg-card p-6 shadow-soft">
                <h3 className="text-sm font-bold">{title}</h3>
                <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                  {rows.map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-xs text-muted-foreground">{k}</dt>
                      <dd className="text-sm font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

function StatBox({ label, value, tone }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <p className={`font-display text-xl font-bold ${tone || "text-foreground"}`}>{value}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
