import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useCurrentUser,
  useHostels,
  useSubmitApplication,
  useApplications,
} from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/apply")({
  head: () => ({
    meta: [
      { title: "Hostel Application · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Submit your BIT hostel application with personal, parent and medical details.",
      },
      { property: "og:title", content: "Hostel Application · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Submit your BIT hostel application with personal, parent and medical details.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: currentUser } = useCurrentUser();
  const { data: hostelsData = [] } = useHostels();
  const submitMutation = useSubmitApplication();
  const navigate = useNavigate();

  const student = currentUser || {};
  const isFemale =
    student.wardenType === "Girls" ||
    student.regNo === "gwarden123" ||
    student.gender?.toLowerCase() === "female";
  const requiredType = isFemale ? "Girls" : "Boys";

  const rawHostels = Array.isArray(hostelsData) ? hostelsData : [];
  const hostelsList = rawHostels.filter((h) => h.type === requiredType);

  const { data: userApps = [] } = useApplications({ regNo: student.regNo });
  const myApps = Array.isArray(userApps) ? userApps : [];
  const latestApp = myApps[0];

  const [selectedHostel, setSelectedHostel] = useState("");
  const [roomType, setRoomType] = useState("Non-AC");
  const [sharing, setSharing] = useState("2");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const hostelObj = hostelsList.find((h) => h.id === selectedHostel || h.name === selectedHostel) || hostelsList[0];
    const hostelId = hostelObj ? hostelObj.id : (isFemale ? "H07" : "H01");
    const hostelName = hostelObj ? hostelObj.name : (isFemale ? "Ganga Block" : "Sapphire Block");

    submitMutation.mutate(
      {
        regNo: student.regNo || "7376242AD142",
        studentName: student.name || "Student",
        hostelId,
        hostelName,
        roomType,
        sharing: Number(sharing),
        notes,
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Application Failed", { description: res.error });
          } else {
            toast.success("Application Submitted Successfully", {
              description: "Your application is submitted for Warden review and Admin approval.",
            });
            navigate({ to: "/dashboard" });
          }
        },
        onError: (err) => {
          toast.error("Submission Error", { description: err.message });
        },
      },
    );
  };

  return (
    <AppShell title="Hostel application" breadcrumb={["Apply"]}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Student information ({requiredType} Hostel Application)</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full name</Label>
                <Input defaultValue={student.name || ""} required />
              </div>
              <div className="space-y-2">
                <Label>Register number</Label>
                <Input defaultValue={student.regNo || ""} required readOnly />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input defaultValue={(student.department || student.dept || "CSE").replace(/CSa?E/gi, "CSE")} required />
              </div>
              <div className="space-y-2">
                <Label>Year</Label>
                <Input defaultValue={String(student.year || 1)} required />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Input defaultValue={student.gender || "Male"} readOnly />
              </div>
              <div className="space-y-2">
                <Label>Mobile number</Label>
                <Input defaultValue={student.mobile || "9876543210"} required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Permanent address</Label>
                <Textarea
                  rows={3}
                  placeholder="Door no, street, city, district, pincode"
                  required
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Parent & medical details</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Parent / guardian name</Label>
                <Input required defaultValue="R. Subramanian" />
              </div>
              <div className="space-y-2">
                <Label>Parent mobile number</Label>
                <Input inputMode="numeric" required defaultValue="9843112233" />
              </div>
              <div className="space-y-2">
                <Label>Occupation</Label>
                <Input defaultValue="Agriculturist" />
              </div>
              <div className="space-y-2">
                <Label>Blood group</Label>
                <Input placeholder="O+" defaultValue="O+" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Medical conditions or allergies</Label>
                <Textarea
                  rows={2}
                  placeholder="Mention any condition the warden should know about"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-lg font-bold">Preferences</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Hostel preference ({requiredType} Hostels Only)</Label>
                <select
                  value={selectedHostel}
                  onChange={(e) => setSelectedHostel(e.target.value)}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select {requiredType} Hostel Block</option>
                  {hostelsList.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name} ({h.type} Hostel)
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Room type & sharing</Label>
                <select
                  value={`${roomType}-${sharing}`}
                  onChange={(e) => {
                    const [t, s] = e.target.value.split("-");
                    setRoomType(t);
                    setSharing(s);
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
                >
                  <option value="AC-2">AC · 2 sharing</option>
                  <option value="AC-3">AC · 3 sharing</option>
                  <option value="Non-AC-4">Non-AC · 4 sharing</option>
                  <option value="Non-AC-2">Non-AC · 2 sharing</option>
                </select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Additional Notes / Special Requirements</Label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="E.g., prefer ground floor room, study quiet zone"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-sm font-bold">Application submission</h2>
            <Progress value={90} className="mt-3" />
            <p className="mt-2 text-xs text-muted-foreground">Ready for Warden Review & Admin Approval.</p>
            <div className="mt-4 flex gap-3">
              <Button type="submit" variant="hero" disabled={submitMutation.isPending} className="flex-1">
                {submitMutation.isPending ? "Submitting..." : "Submit application"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => toast("Draft saved")}
              >
                Save draft
              </Button>
            </div>
          </section>
        </form>

        {/* Application Status Tracker */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft h-fit">
          <h2 className="text-sm font-bold">Hostel Application Status Tracker</h2>
          {latestApp ? (
            <div className="mt-4 rounded-xl bg-muted/50 p-4 space-y-2 border">
              <p className="text-xs font-bold text-primary">Application ID: #{latestApp.id}</p>
              <p className="text-sm font-medium">Requested Block: {latestApp.hostelName}</p>
              <p className="text-xs text-muted-foreground">Room Type: {latestApp.roomType} ({latestApp.sharing} sharing)</p>
              <p className="text-xs font-semibold">
                Current Status:{" "}
                <span className={`font-bold ${
                  latestApp.status === "Approved by Warden"
                    ? "text-blue-600 dark:text-blue-400"
                    : latestApp.status === "Room Allotted" || latestApp.status === "Approved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : latestApp.status.includes("Rejected")
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  {latestApp.status === "Approved by Warden"
                    ? "Approved by Warden (Awaiting Admin Room Allotment)"
                    : latestApp.status === "Room Allotted" || latestApp.status === "Approved"
                    ? `Room ${latestApp.allottedRoom || "101"} Allotted in ${latestApp.hostelName}`
                    : latestApp.status}
                </span>
              </p>
            </div>
          ) : null}

          <ol className="mt-5 space-y-6 border-l pl-5">
            {[
              [
                "Submitted",
                latestApp ? `Submitted on ${latestApp.appliedDate}` : "No active application",
                !!latestApp,
              ],
              [
                "Warden Review",
                latestApp?.status === "Approved by Warden" ||
                latestApp?.status === "Approved" ||
                latestApp?.status === "Room Allotted"
                  ? "Warden Approved & Forwarded to Admin"
                  : latestApp?.status === "Pending Warden Review" || latestApp?.status === "Pending"
                    ? "Under Review by Warden"
                    : latestApp?.status.includes("Rejected")
                    ? "Rejected"
                    : "Pending Warden Review",
                !!latestApp && !latestApp.status.includes("Rejected"),
              ],
              [
                "Admin Approval",
                latestApp?.status === "Approved" || latestApp?.status === "Room Allotted"
                  ? "Approved by System Admin"
                  : latestApp?.status === "Approved by Warden"
                    ? "Awaiting Admin Room Allotment"
                    : "Pending Admin Review",
                latestApp?.status === "Approved by Warden" ||
                latestApp?.status === "Approved" ||
                latestApp?.status === "Room Allotted",
              ],
              [
                "Room Allotted",
                latestApp?.status === "Approved" || latestApp?.status === "Room Allotted"
                  ? `Room ${latestApp.allottedRoom || "101"} Allotted in ${latestApp.hostelName}`
                  : "Pending Allotment",
                latestApp?.status === "Approved" || latestApp?.status === "Room Allotted",
              ],
            ].map(([s, d, active]) => (
              <li key={s} className="relative">
                <span
                  className={`absolute -left-[26px] top-1 size-3 rounded-full ring-4 ring-card ${active ? "bg-primary" : "bg-muted-foreground/40"}`}
                />
                <p className="text-sm font-semibold">{s}</p>
                <p className="text-xs text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AppShell>
  );
}
