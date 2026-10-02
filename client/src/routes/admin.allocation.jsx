import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  useApplications,
  useRoomChangeRequests,
  useUpdateApplicationStatus,
  useUpdateRoomChangeStatus,
} from "@/hooks/use-hostel-api";
import { BedDouble, ClipboardList, Layers, ShieldCheck } from "lucide-react";
import { RoomFloorPickerModal } from "@/components/admin/room-floor-picker";

export const Route = createFileRoute("/admin/allocation")({
  head: () => ({
    meta: [
      { title: "Room Allocation Desk · BIT Admin Portal" },
      {
        name: "description",
        content: "Process hostel applications, room change requests and perform manual room allotments.",
      },
    ],
  }),
  component: RoomAllocationPage,
});

function RoomAllocationPage() {
  const { data: applicationsData = [] } = useApplications();
  const { data: roomChangesData = [] } = useRoomChangeRequests();

  const updateAppMutation = useUpdateApplicationStatus();
  const updateRcMutation = useUpdateRoomChangeStatus();

  const [manualAppRooms, setManualAppRooms] = useState({});
  const [manualRcRooms, setManualRcRooms] = useState({});
  const [activePicker, setActivePicker] = useState(null); // { type: 'app' | 'rc', item: Object }

  const appsList = Array.isArray(applicationsData) ? applicationsData : [];
  const roomChangesList = Array.isArray(roomChangesData) ? roomChangesData : [];

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

  const handleAdminApproveApp = (id, hostelName, studentName) => {
    const roomNo = manualAppRooms[id] || "101";
    updateAppMutation.mutate(
      { id, status: "Room Allotted", allottedRoom: roomNo },
      {
        onSuccess: () => {
          toast.success("Hostel Application Approved & Room Allotted", {
            description: `${studentName} has been manually allotted Room ${roomNo} in ${hostelName}.`,
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
            description: `Hostel application #${id} has been rejected.`,
          });
        },
      },
    );
  };

  const handleAdminAllotRoom = (id, targetHostel, studentName) => {
    const roomNo = manualRcRooms[id] || "204";
    updateRcMutation.mutate(
      { id, status: "Room Allotted", allottedRoom: roomNo },
      {
        onSuccess: () => {
          toast.success("Room Change Approved & Allotted", {
            description: `${studentName}'s room change request approved. Room ${roomNo} allotted in ${targetHostel}.`,
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
          toast.error("Room Change Rejected", {
            description: `Room change request #${id} has been rejected.`,
          });
        },
      },
    );
  };

  return (
    <AppShell title="Manual Room Allocation & Approval Desk" breadcrumb={["Admin", "Allocation"]}>
      <div className="grid gap-6">
        {/* Hostel Applications Desk */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ClipboardList className="size-5 text-primary" /> New Student Hostel Applications
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review applications approved by Wardens, inspect floor-by-floor availability, manually select rooms, and complete allotment.
          </p>
          <div className="mt-4 space-y-3">
            {appsList.length > 0 ? (
              appsList.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
                  <div>
                    <p className="text-sm font-bold">{a.studentName} ({a.regNo})</p>
                    <p className="text-xs text-muted-foreground">
                      Requested Block: <span className="font-semibold text-primary">{a.hostelName}</span> · Room Type: {a.roomType} ({a.sharing} sharing)
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
              <p className="py-6 text-center text-sm text-muted-foreground">No pending hostel applications awaiting admin room allotment.</p>
            )}
          </div>
        </section>

        {/* Room Change Desk */}
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BedDouble className="size-5 text-primary" /> Room Change Requests Desk
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Review room change requests approved by Wardens, inspect floor availability, assign new room numbers, and complete allotment.
          </p>
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
              <p className="py-6 text-center text-sm text-muted-foreground">No pending room change requests awaiting admin room allotment.</p>
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
