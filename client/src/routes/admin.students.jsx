import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, Users, Filter, Download } from "lucide-react";
import { students as mockStudents } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/students")({
  head: () => ({
    meta: [
      { title: "Student Management · BIT Admin Portal" },
      {
        name: "description",
        content: "Manage student profiles, registrations, hostel allocations and academic details.",
      },
    ],
  }),
  component: StudentManagementPage,
});

function StudentManagementPage() {
  const [q, setQ] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [yearFilter, setYearFilter] = useState("All");

  const filteredStudents = useMemo(() => {
    return mockStudents.filter((s) => {
      const matchesQuery =
        s.name.toLowerCase().includes(q.toLowerCase()) ||
        s.regNo.toLowerCase().includes(q.toLowerCase()) ||
        (s.dept || s.department || "").toLowerCase().includes(q.toLowerCase());
      const matchesGender = genderFilter === "All" || s.gender === genderFilter;
      const matchesYear = yearFilter === "All" || String(s.year) === yearFilter;
      return matchesQuery && matchesGender && matchesYear;
    });
  }, [q, genderFilter, yearFilter]);

  return (
    <AppShell title="Student Management" breadcrumb={["Admin", "Students"]}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="relative min-w-64 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, register no, or department..."
            className="pl-9"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" /> Filter:
          </div>
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male Only</option>
            <option value="Female">Female Only</option>
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="h-9 rounded-xl border border-input bg-background px-3 text-xs font-semibold"
          >
            <option value="All">All Years</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.success("Exported student list as CSV")}
          >
            <Download className="mr-1.5 size-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Reg Number</th>
                <th className="px-4 py-3">Dept & Year</th>
                <th className="px-4 py-3">Gender</th>
                <th className="px-4 py-3">Hostel Block</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">CGPA</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredStudents.slice(0, 25).map((s) => (
                <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} alt="" className="size-8 rounded-full object-cover" />
                      <div>
                        <p className="font-bold">{s.name}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">{s.regNo}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold">{s.dept || s.department}</p>
                    <p className="text-xs text-muted-foreground">Year {s.year}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.gender === "Female" ? "secondary" : "outline"}>
                      {s.gender}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {s.hostel ? (
                      <Badge variant="default">{s.hostel}</Badge>
                    ) : (
                      <Badge variant="secondary">Not Allotted</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">{s.room || "—"}</td>
                  <td className="px-4 py-3 font-semibold text-primary">{s.cgpa || "8.50"}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="soft"
                      onClick={() => toast.info(`Viewing details for ${s.name}`)}
                    >
                      View Profile
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
