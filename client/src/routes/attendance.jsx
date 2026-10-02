import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { useAttendance, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/attendance")({
  head: () => ({
    meta: [
      { title: "Hostel Attendance · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "View your monthly hostel attendance calendar with present, absent and leave days and download reports.",
      },
      { property: "og:title", content: "Hostel Attendance · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "View your monthly hostel attendance calendar with present, absent and leave days and download reports.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const { data: attendanceData = [] } = useAttendance({ regNo: student.regNo });
  const days =
    Array.isArray(attendanceData) && attendanceData.length > 0 ? attendanceData.slice(0, 31) : [];

  const count = (s) => days.filter((d) => d.status === s).length;
  const total = days.length > 0 ? days.length : 1;
  const pct = Math.round((count("Present") / total) * 100);
  return (
    <AppShell
      title="Attendance"
      breadcrumb={["Attendance"]}
      actions={
        <Button variant="outline" onClick={() => toast.success("Report downloaded")}>
          Download report
        </Button>
      }
    >
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">July 2026</h2>
          <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs text-muted-foreground">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((d, i) => (
              <div
                key={d.id}
                className={`flex aspect-square flex-col items-center justify-center rounded-xl text-sm font-semibold ${d.status === "Present" ? "bg-accent/15 text-accent" : d.status === "Absent" ? "bg-destructive/10 text-destructive" : "bg-warning/15 text-warning"}`}
              >
                {i + 1}
                <span className="text-[9px] font-medium opacity-80">{d.status.slice(0, 3)}</span>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-4">
          <div className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <p className="font-display text-5xl font-extrabold text-primary">{pct}%</p>
            <p className="mt-1 text-sm text-muted-foreground">Monthly attendance</p>
            <Progress value={pct} className="mt-4" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Present", count("Present")],
              ["Absent", count("Absent")],
              ["Leave", count("Leave")],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl border bg-card p-4 text-center shadow-soft">
                <p className="font-display text-2xl font-bold">{v}</p>
                <p className="text-xs text-muted-foreground">{l}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
