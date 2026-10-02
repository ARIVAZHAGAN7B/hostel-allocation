import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useCurrentUser,
  useHostels,
  useSubmitRoomChange,
  useRoomChangeRequests,
} from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/room-change")({
  head: () => ({
    meta: [
      { title: "Room Change Request · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Raise a hostel room change request with a reason, preferred room and supporting proof.",
      },
      { property: "og:title", content: "Room Change Request · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Raise a hostel room change request with a reason, preferred room and supporting proof.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const { data: hostelsData = [] } = useHostels();
  const submitRoomChangeMutation = useSubmitRoomChange();

  const student = user || {};
  const isFemale =
    student.wardenType === "Girls" ||
    student.regNo === "gwarden123" ||
    student.gender?.toLowerCase() === "female";
  const requiredType = isFemale ? "Girls" : "Boys";
  const rawHostels = Array.isArray(hostelsData) ? hostelsData : [];
  const hostelsList = rawHostels.filter((h) => h.type === requiredType);

  const { data: userRequests = [] } = useRoomChangeRequests({ regNo: student.regNo });
  const myRequests = Array.isArray(userRequests) ? userRequests : [];
  const latestRequest = myRequests[0];

  const [targetHostel, setTargetHostel] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please specify a reason for the room change request");
      return;
    }

    submitRoomChangeMutation.mutate(
      {
        regNo: student.regNo || "7376242AD142",
        studentName: student.name || "Student",
        currentHostel: student.hostel || "Sapphire Block",
        currentRoom: student.room || "312",
        targetHostel: targetHostel || (hostelsList[0] ? hostelsList[0].name : "Emerald Block"),
        reason,
      },
      {
        onSuccess: (res) => {
          if (res && res.error) {
            toast.error("Room Change Error", { description: res.error });
          } else {
            toast.success("Room Change Request Submitted", {
              description: "Your request has been registered in MongoDB.",
            });
            setReason("");
          }
        },
        onError: (err) => {
          toast.error("Submission Error", { description: err.message });
        },
      },
    );
  };

  return (
    <AppShell title="Room change request" breadcrumb={["Room change"]}>
      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Current hostel</Label>
              <Input defaultValue={student.hostel ?? "Sapphire Block"} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Current room</Label>
              <Input defaultValue={student.room ?? "312"} readOnly />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Target / Preferred Hostel Block</Label>
              <select
                value={targetHostel}
                onChange={(e) => setTargetHostel(e.target.value)}
                className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
              >
                <option value="">Select Preferred Hostel</option>
                {hostelsList.map((h) => (
                  <option key={h.id} value={h.name}>
                    {h.name} ({h.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Reason for change</Label>
            <Textarea
              rows={4}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why you need a different room or hostel block"
            />
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm">
            <span>Upload supporting proof (Medical / Preference)</span>
            <span className="text-xs font-semibold text-primary">Choose file</span>
            <input type="file" className="sr-only" />
          </label>
          <Button type="submit" variant="hero" disabled={submitRoomChangeMutation.isPending}>
            {submitRoomChangeMutation.isPending ? "Submitting..." : "Submit request"}
          </Button>
        </form>

        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-sm font-bold">Request status tracker</h2>
          {latestRequest ? (
            <div className="mt-4 rounded-xl bg-muted/50 p-4 space-y-2 border">
              <p className="text-xs font-bold text-primary">Latest Request: #{latestRequest.id}</p>
              <p className="text-sm font-medium">Target: {latestRequest.targetHostel}</p>
              <p className="text-xs text-muted-foreground">Reason: {latestRequest.reason}</p>
              <p className="text-xs font-semibold">
                Current Status:{" "}
                <span className={`font-bold ${
                  latestRequest.status === "Approved by Warden"
                    ? "text-blue-600 dark:text-blue-400"
                    : latestRequest.status === "Room Allotted" || latestRequest.status === "Approved"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : latestRequest.status.includes("Rejected")
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  {latestRequest.status === "Approved by Warden"
                    ? "Approved by Warden (Awaiting Admin Room Allotment)"
                    : latestRequest.status === "Room Allotted" || latestRequest.status === "Approved"
                    ? `Room ${latestRequest.allottedRoom || "204"} Allotted in ${latestRequest.targetHostel}`
                    : latestRequest.status}
                </span>
              </p>
            </div>
          ) : null}

          <ol className="mt-5 space-y-6 border-l pl-5">
            {[
              [
                "Submitted",
                latestRequest ? `Submitted on ${latestRequest.appliedDate}` : "No active request",
                !!latestRequest,
              ],
              [
                "Warden review",
                latestRequest?.status === "Approved by Warden" ||
                latestRequest?.status === "Approved" ||
                latestRequest?.status === "Room Allotted"
                  ? "Warden Approved & Forwarded to Admin"
                  : latestRequest?.status === "Pending Warden Review" || latestRequest?.status === "Pending"
                    ? "Under Review by Warden"
                    : latestRequest?.status.includes("Rejected")
                    ? "Rejected"
                    : "Pending Warden Review",
                !!latestRequest && !latestRequest.status.includes("Rejected"),
              ],
              [
                "Admin approval",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted"
                  ? "Approved by System Admin"
                  : latestRequest?.status === "Approved by Warden"
                    ? "Awaiting Admin Room Allotment"
                    : "Pending Admin Review",
                latestRequest?.status === "Approved by Warden" ||
                latestRequest?.status === "Approved" ||
                latestRequest?.status === "Room Allotted",
              ],
              [
                "Room allotted",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted"
                  ? `Room ${latestRequest.allottedRoom || "204"} Allotted in ${latestRequest.targetHostel}`
                  : "Pending Allotment",
                latestRequest?.status === "Approved" || latestRequest?.status === "Room Allotted",
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
