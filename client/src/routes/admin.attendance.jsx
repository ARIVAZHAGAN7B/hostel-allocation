import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAttendance, useMarkAttendance } from "@/hooks/use-hostel-api";
import { CalendarCheck, UserCheck, Search } from "lucide-react";

export const Route = createFileRoute("/admin/attendance")({
  head: () => ({
    meta: [
      { title: "Hostel Attendance · BIT Admin Portal" },
      {
        name: "description",
        content: "Track student attendance records, missing logs and mark daily hostel attendance.",
      },
    ],
  }),
  component: AdminAttendancePage,
});

function AdminAttendancePage() {
  const { data: attendanceData = [] } = useAttendance();
  const markAttMutation = useMarkAttendance();

  const [attRegNo, setAttRegNo] = useState("");
  const [attName, setAttName] = useState("");
  const [attStatus, setAttStatus] = useState("Present");
  const [q, setQ] = useState("");

  const logs = Array.isArray(attendanceData) ? attendanceData : [];
  const filtered = logs.filter((l) => (l.regNo || "").toLowerCase().includes(q.toLowerCase()));

  const handleMarkAttendance = (e) => {
    e.preventDefault();
    if (!attRegNo) {
      toast.error("Enter student register number");
      return;
    }

    markAttMutation.mutate(
      {
        regNo: attRegNo,
        studentName: attName || "Student",
        status: attStatus,
        date: new Date().toISOString().slice(0, 10),
      },
      {
        onSuccess: () => {
          toast.success("Attendance Saved", {
            description: `Record saved for ${attRegNo} by Admin.`,
          });
          setAttRegNo("");
          setAttName("");
        },
      },
    );
  };

  return (
    <AppShell title="Hostel Attendance Monitoring" breadcrumb={["Admin", "Attendance"]}>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.8fr]">
        {/* Left: Log Attendance Form */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft h-fit">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserCheck className="size-5 text-primary" /> Mark Daily Attendance
          </h2>
          <form onSubmit={handleMarkAttendance} className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label>Student Register Number</Label>
              <Input
                required
                value={attRegNo}
                onChange={(e) => setAttRegNo(e.target.value)}
                placeholder="E.g. 7376242AD142"
              />
            </div>
            <div className="space-y-2">
              <Label>Student Name</Label>
              <Input
                value={attName}
                onChange={(e) => setAttName(e.target.value)}
                placeholder="Student name"
              />
            </div>
            <div className="space-y-2">
              <Label>Attendance Status</Label>
              <select
                value={attStatus}
                onChange={(e) => setAttStatus(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">On Leave</option>
              </select>
            </div>
            <Button type="submit" variant="hero" disabled={markAttMutation.isPending} className="w-full">
              {markAttMutation.isPending ? "Recording..." : "Save Attendance Log"}
            </Button>
          </form>
        </section>

        {/* Right: Recent Logs List */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CalendarCheck className="size-5 text-primary" /> Attendance Logs Directory
            </h2>
            <div className="relative min-w-48">
              <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Filter by reg number..."
                className="h-8 pl-8 text-xs"
              />
            </div>
          </div>

          <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
            {filtered.slice(0, 30).map((l) => (
              <div
                key={l.id || l._id}
                className="flex items-center justify-between rounded-xl border p-3 text-xs"
              >
                <div>
                  <p className="font-bold">{l.regNo || "7376242AD142"}</p>
                  <p className="text-[11px] text-muted-foreground">Logged Date: {l.date}</p>
                </div>
                <Badge
                  variant={
                    l.status === "Present"
                      ? "default"
                      : l.status === "Absent"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {l.status}
                </Badge>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
