import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHostels } from "@/hooks/use-hostel-api";
import { Building2, Search, Users, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/hostels")({
  head: () => ({
    meta: [
      { title: "Hostel Management · BIT Admin Portal" },
      {
        name: "description",
        content: "Manage all 13 BIT hostel blocks, block capacities, room counts and warden assignments.",
      },
    ],
  }),
  component: HostelManagementPage,
});

function HostelManagementPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");

  const { data: hostelsData = [] } = useHostels(type, q);
  const list = Array.isArray(hostelsData) ? hostelsData : [];

  return (
    <AppShell
      title="Hostel Management"
      breadcrumb={["Admin", "Hostels"]}
      actions={
        <Button variant="hero" onClick={() => toast.info("Add Block feature opening...")}>
          <Plus className="mr-1.5 size-4" /> Add Hostel Block
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hostel block or warden name..."
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          {["All", "Boys", "Girls"].map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                type === t ? "bg-card text-primary shadow-soft" : "text-muted-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((h) => {
          const available = h.capacity - h.occupied;
          const pct = Math.round((h.occupied / h.capacity) * 100);
          return (
            <div
              key={h.id}
              className="overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:shadow-elegant"
            >
              <div className="relative h-36 overflow-hidden bg-muted">
                <img
                  src={h.image}
                  alt={h.name}
                  className="size-full object-cover"
                />
                <Badge
                  className="absolute top-3 left-3"
                  variant={h.type === "Boys" ? "default" : "secondary"}
                >
                  {h.type} Hostel
                </Badge>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-lg font-bold">{h.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {h.floors} floors · Warden {h.warden}
                    </p>
                  </div>
                  <Building2 className="size-5 text-primary" />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="font-bold text-accent">{available}</p>
                    <p className="text-[10px] text-muted-foreground">Vacant</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="font-bold text-primary">{h.occupied}</p>
                    <p className="text-[10px] text-muted-foreground">Occupied</p>
                  </div>
                  <div className="rounded-xl bg-muted/60 py-2">
                    <p className="font-bold">{h.capacity}</p>
                    <p className="text-[10px] text-muted-foreground">Capacity</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Occupancy Rate</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1.5" />
                </div>

                <Button asChild variant="soft" className="mt-5 w-full">
                  <Link to="/hostels/$hostelId" params={{ hostelId: h.id }}>
                    Manage Rooms & Facilities
                  </Link>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
