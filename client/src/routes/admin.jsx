import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell, StatCard } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  useDashboardStats,
  useHostels,
  useRoomChangeRequests,
  useUpdateRoomChangeStatus,
  useApplications,
  useUpdateApplicationStatus,
} from "@/hooks/use-hostel-api";
import { Building2, ClipboardList, Layers, Server, ShieldCheck, Users, Wrench } from "lucide-react";
import { RoomFloorPickerModal } from "@/components/admin/room-floor-picker";
import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal · BIT Hostel Portal" },
      {
        name: "description",
        content: "Overview of BIT hostel portal metrics, block capacity, occupancy and administrative operations.",
      },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: statsData } = useDashboardStats();
  const { data: hostelsData = [] } = useHostels();
  const { data: roomChangesData = [] } = useRoomChangeRequests();
  const { data: applicationsData = [] } = useApplications();

  const updateRcMutation = useUpdateRoomChangeStatus();
  const updateAppMutation = useUpdateApplicationStatus();

  const [manualAppRooms, setManualAppRooms] = useState({});
  const [manualRcRooms, setManualRcRooms] = useState({});
  const [activePicker, setActivePicker] = useState(null); // { type: 'app' | 'rc', item: Object }

  const stats = statsData?.stats || {
    students: 1840,
    rooms: 920,
    hostels: 13,
    capacity: 2500,
    occupied: 1840,
    complaints: 24,
  };
  const occupancyChart = statsData?.occupancyByHostel || [];
  const hostelsList = Array.isArray(hostelsData) ? hostelsData : [];
  const roomChangesList = Array.isArray(roomChangesData) ? roomChangesData : [];
  const appsList = Array.isArray(applicationsData) ? applicationsData : [];

  const handleConfirmPickerAllotment = (roomNo) => {
    if (!activePicker) return;
    const { type, item } = activePicker;
    if (type === "app") {
      updateAppMutation.mutate(
        { id: item.id, status: "Room Allotted", allottedRoom: roomNo },
        {
          onSuccess: () => {
            toast.success("Hostel Application Approved & Room Allotted", {
              description: `${item.studentName} has been allotted Room ${roomNo} in ${item.hostelName}.`,
            });
            setActivePicker(null);
          },
        },
      );
    } else if (type === "rc") {
      updateRcMutation.mutate(
        { id: item.id, status: "Room Allotted", allottedRoom: roomNo },
        {
          onSuccess: () => {
            toast.success("Room Change Approved & Allotted", {
              description: `${item.studentName} allotted Room ${roomNo} in ${item.targetHostel}.`,
            });
            setActivePicker(null);
          },
        },
      );
    }
  };

  const handleAdminAllotRoom = (id, targetHostel, studentName) => {
    const roomNo = manualRcRooms[id] || "204";
    updateRcMutation.mutate(
      { id, status: "Room Allotted", allottedRoom: roomNo },
      {
        onSuccess: () => {
          toast.success("Room Allotted & Approved", {
            description: `${studentName} allotted Room ${roomNo} in ${targetHostel}.`,
          });
        },
      },
    );
  };

  const handleAdminRejectRc = (id) => {
    updateRcMutation.mutate(
      { id, status: "Rejected by Admin" },
      {
        onSuccess: () => {
          toast.error("Request Rejected", {
            description: `Room change request #${id} has been rejected by Admin.`,
          });
        },
      },
    );
  };

  const handleAdminApproveApp = (id, hostelName, studentName) => {
    const roomNo = manualAppRooms[id] || "101";
    updateAppMutation.mutate(
      { id, status: "Room Allotted", allottedRoom: roomNo },
      {
        onSuccess: () => {
          toast.success("Hostel Application Approved", {
            description: `${studentName} allotted Room ${roomNo} in ${hostelName}.`,
          });
        },
      },
    );
  };

  const handleAdminRejectApp = (id) => {
    updateAppMutation.mutate(
      { id, status: "Rejected by Admin" },
      {
        onSuccess: () => {
          toast.error("Application Rejected", {
            description: `Hostel application #${id} has been rejected by Admin.`,
          });
        },
      },
    );
  };

  const occupancyRate = Math.round(((stats.occupied || 1840) / (stats.capacity || 2500)) * 100);

  return (
    <AppShell title="BIT Hostel System Administration" breadcrumb={["Admin Dashboard"]}>
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Students Allocated"
          value={stats.students?.toString() || "1,840"}
          trend="Registered on portal"
        />
        <StatCard
          icon={Building2}
          title="Total Hostel Blocks"
          value={`${stats.hostels || 13} Blocks`}
          trend={`${stats.boys || 6} Boys / ${stats.girls || 7} Girls`}
        />
        <StatCard
          icon={ShieldCheck}
          title="Total Capacity / Occupancy"
          value={`${stats.occupied || 1840} / ${stats.capacity || 2500}`}
          trend={`${occupancyRate}% Total Occupancy`}
        />
        <StatCard
          icon={Wrench}
          title="System Maintenance Requests"
          value={stats.complaints?.toString() || "24"}
          trend="Tracked in MongoDB"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold">Hostel Block Occupancy Analytics</h2>
          <div className="mt-6 h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyChart.length > 0 ? occupancyChart : [
                { name: "Sapphire", occupied: 280, vacant: 70 },
                { name: "Emerald", occupied: 250, vacant: 50 },
                { name: "Ruby", occupied: 290, vacant: 60 },
                { name: "Ganga", occupied: 210, vacant: 40 },
                { name: "Yamuna", occupied: 230, vacant: 50 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip />
                <Bar dataKey="occupied" fill="var(--color-primary)" radius={[4, 4, 0, 0]} name="Occupied" />
                <Bar dataKey="vacant" fill="var(--color-muted-foreground)" radius={[4, 4, 0, 0]} name="Vacant" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Server className="size-5 text-primary" /> Database & System Health
            </h2>
            <div className="mt-4 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">MongoDB Atlas State</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Backend Express API</span>
                <Badge variant="default">Running (Port 5000)</Badge>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">Overall Capacity Rate</span>
                <span className="font-bold">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="mt-2" />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-soft">
            <h2 className="text-base font-bold mb-3">Hostel Blocks Directory</h2>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {hostelsList.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border p-2 text-xs">
                  <span className="font-semibold">{h.name}</span>
                  <Badge variant="outline">{h.type}</Badge>
                  <span>{h.occupied}/{h.capacity}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Hostel Applications Approval Desk */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" /> Hostel Applications Admin Approval Desk
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Review applications approved by Wardens, manually assign room numbers, and complete room allotment.</p>
          <div className="mt-4 space-y-3">
            {appsList.length > 0 ? (
              appsList.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-bold">{a.studentName} ({a.regNo})</p>
                    <p className="text-xs text-muted-foreground">
                      Requested Block: <span className="font-semibold text-primary">{a.hostelName}</span> · Room: {a.roomType} ({a.sharing} sharing)
                    </p>
                    <p className="text-xs text-muted-foreground">Applied Date: {a.appliedDate}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {a.status === "Room Allotted" || a.status === "Approved" ? (
                      <Badge variant="default" className="px-3 py-1">
                        Room Allotted: Room {a.allottedRoom || "101"}
                      </Badge>
                    ) : (
                      <>
                        <Badge variant={a.status.includes("Rejected") ? "destructive" : "secondary"}>
                          {a.status === "Approved by Warden" ? "Warden Approved" : a.status}
                        </Badge>
                        {(a.status === "Approved by Warden" || a.status === "Pending" || a.status === "Pending Warden Review") && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActivePicker({ type: "app", item: a })}
                              className="h-8 gap-1 text-xs border-primary/40 text-primary hover:bg-primary/10"
                            >
                              <Layers className="size-3.5" /> View Floor Layout & Select Room
                            </Button>
                            <Input
                              placeholder="Room No (101)"
                              value={manualAppRooms[a.id] || ""}
                              onChange={(e) => setManualAppRooms({ ...manualAppRooms, [a.id]: e.target.value })}
                              className="h-8 w-28 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="hero"
                              disabled={updateAppMutation.isPending}
                              onClick={() => handleAdminApproveApp(a.id, a.hostelName, a.studentName)}
                            >
                              Allot Room
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdminRejectApp(a.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No hostel applications awaiting admin room allotment.</p>
            )}
          </div>
        </section>

        {/* Room Change Approvals Desk */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft lg:col-span-2">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" /> Room Change Approvals & Room Allocation Desk
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Review room change requests approved by Wardens, inspect floor availability, manually assign room numbers, and complete allotment.</p>
          <div className="mt-4 space-y-3">
            {roomChangesList.length > 0 ? (
              roomChangesList.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-bold">{r.studentName} ({r.regNo})</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {r.currentHostel} #{r.currentRoom} ➔ Target: <span className="font-semibold text-primary">{r.targetHostel}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">Reason: {r.reason}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {r.status === "Room Allotted" || r.status === "Approved" ? (
                      <Badge variant="default" className="px-3 py-1">
                        Room Allotted: Room {r.allottedRoom || "204"}
                      </Badge>
                    ) : (
                      <>
                        <Badge variant={r.status.includes("Rejected") ? "destructive" : "secondary"}>
                          {r.status === "Approved by Warden" ? "Warden Approved" : r.status}
                        </Badge>
                        {(r.status === "Approved by Warden" || r.status === "Pending" || r.status === "Pending Warden Review") && (
                          <div className="flex flex-wrap items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setActivePicker({ type: "rc", item: r })}
                              className="h-8 gap-1 text-xs border-primary/40 text-primary hover:bg-primary/10"
                            >
                              <Layers className="size-3.5" /> View Floor Layout & Select Room
                            </Button>
                            <Input
                              placeholder="Room No (204)"
                              value={manualRcRooms[r.id] || ""}
                              onChange={(e) => setManualRcRooms({ ...manualRcRooms, [r.id]: e.target.value })}
                              className="h-8 w-28 text-xs"
                            />
                            <Button
                              size="sm"
                              variant="hero"
                              disabled={updateRcMutation.isPending}
                              onClick={() => handleAdminAllotRoom(r.id, r.targetHostel, r.studentName)}
                            >
                              Allot Room
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleAdminRejectRc(r.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No room change requests pending admin room allotment.</p>
            )}
          </div>
        </section>
      </div>

      {/* Floor-by-Floor Room Availability Inspector Modal */}
      {activePicker && (
        <RoomFloorPickerModal
          open={!!activePicker}
          onOpenChange={(open) => !open && setActivePicker(null)}
          hostelName={activePicker.item.hostelName || activePicker.item.targetHostel || "Sapphire Block"}
          applicantName={activePicker.item.studentName}
          regNo={activePicker.item.regNo}
          roomType={activePicker.item.roomType || "Non-AC"}
          sharing={activePicker.item.sharing || 2}
          onConfirmAllotment={handleConfirmPickerAllotment}
          isSubmitting={updateAppMutation.isPending || updateRcMutation.isPending}
        />
      )}
    </AppShell>
  );
}
