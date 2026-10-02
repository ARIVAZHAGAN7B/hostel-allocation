import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useDashboardStats } from "@/hooks/use-hostel-api";
import { FileBarChart, Download, Building2, Users, Wrench, CreditCard } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({
    meta: [
      { title: "Reports & Analytics · BIT Admin Portal" },
      {
        name: "description",
        content: "Download hostel occupancy, maintenance resolution and fee collection reports.",
      },
    ],
  }),
  component: ReportsPage,
});

function ReportsPage() {
  const { data: statsData } = useDashboardStats();

  const occupancyChart = statsData?.occupancyByHostel || [
    { name: "Sapphire", occupied: 280, vacant: 70 },
    { name: "Emerald", occupied: 250, vacant: 50 },
    { name: "Ruby", occupied: 290, vacant: 60 },
    { name: "Ganga", occupied: 210, vacant: 40 },
    { name: "Yamuna", occupied: 230, vacant: 50 },
  ];

  const handleExport = (reportName) => {
    toast.success(`Exported ${reportName}`, {
      description: "Report file generated and downloaded as PDF/CSV.",
    });
  };

  return (
    <AppShell
      title="System Reports & Export Analytics"
      breadcrumb={["Admin", "Reports"]}
      actions={
        <Button variant="hero" onClick={() => handleExport("Full System Comprehensive Report")}>
          <Download className="mr-1.5 size-4" /> Download Complete Report
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Occupancy Analytics Report */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-5 text-primary" /> Block Occupancy & Capacity Report
            </h2>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleExport("Occupancy & Capacity PDF")}
            >
              <Download className="mr-1 size-3.5" /> PDF
            </Button>
          </div>

          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyChart}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={11} />
                <YAxis stroke="#888888" fontSize={11} />
                <Tooltip />
                <Bar dataKey="occupied" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Occupied" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Available Export Templates */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileBarChart className="size-5 text-primary" /> Quick Export Reports
          </h2>
          <div className="space-y-3">
            {[
              ["Hostel Block Capacity & Allotment Summary", "PDF & Excel Format", "Occupancy"],
              ["Student Attendance Monthly Summary Report", "CSV Data Export", "Attendance"],
              ["Maintenance Complaints & Turnaround Analytics", "PDF Breakdown", "Complaints"],
              ["Hostel Fee Dues & Payment Status Report", "Financial Excel Sheet", "Payments"],
            ].map(([title, desc, badge]) => (
              <div
                key={title}
                className="flex items-center justify-between rounded-2xl border bg-card p-4 shadow-soft transition-all hover:shadow-elegant"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{title}</p>
                    <Badge variant="secondary">{badge}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
                <Button size="sm" variant="soft" onClick={() => handleExport(title)}>
                  <Download className="mr-1.5 size-3.5" /> Export
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
