import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { toast } from "sonner";
import { BedDouble, CheckCircle2, DoorOpen, IndianRupee, Layers, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { hostels, rooms, students } from "@/lib/mock-data";
export const Route = createFileRoute("/hostels/$hostelId")({
  loader: ({ params }) => {
    const hostel = hostels.find((h) => h.id === params.hostelId);
    if (!hostel) throw notFound();
    return {
      hostel,
      hostelRooms: rooms.filter((r) => r.hostelId === hostel.id).slice(0, 12),
      residents: students.filter((s) => s.hostel === hostel.name).slice(0, 6),
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Hostel not found" }, { name: "robots", content: "noindex" }] };
    }
    const title = `${loaderData.hostel.name} · Room Details`;
    return {
      meta: [
        { title },
        {
          name: "description",
          content: `Rooms, facilities, occupancy and residents of ${loaderData.hostel.name}, a ${loaderData.hostel.type.toLowerCase()} hostel block at BIT.`,
        },
        { property: "og:title", content: title },
        {
          property: "og:description",
          content: `Floor-wise room availability and facilities for ${loaderData.hostel.name}.`,
        },
      ],
    };
  },
  component: HostelDetail,
});
function HostelDetail() {
  const { hostel, hostelRooms, residents } = Route.useLoaderData();
  const pct = Math.round((hostel.occupied / hostel.capacity) * 100);
  return (
    <AppShell title={hostel.name} breadcrumb={["Hostels", hostel.name]}>
      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
            <img
              src={hostel.image}
              alt={hostel.name}
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            <div className="p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{hostel.type} hostel</Badge>
                <Badge variant="outline">{hostel.floors} floors</Badge>
                <Badge variant="outline">Warden {hostel.warden}</Badge>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric icon={DoorOpen} label="Total rooms" value={hostel.totalRooms} />
                <Metric icon={Users} label="Capacity" value={hostel.capacity} />
                <Metric icon={BedDouble} label="Occupied" value={hostel.occupied} />
                <Metric
                  icon={Layers}
                  label="Available seats"
                  value={hostel.capacity - hostel.occupied}
                />
              </div>
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Block occupancy</span>
                  <span className="font-semibold text-foreground">{pct}%</span>
                </div>
                <Progress value={pct} className="mt-1.5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="text-lg font-bold">Rooms in this block</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {hostelRooms.map((r) => {
                const free = r.capacity - r.occupied;
                return (
                  <div
                    key={r.id}
                    className="rounded-2xl border p-4 transition-all hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-display text-lg font-bold">Room {r.number}</p>
                      <Badge variant={free > 0 ? "secondary" : "outline"}>
                        {free > 0 ? `${free} free` : "Full"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Floor {r.floor === 0 ? "Ground" : r.floor} · {r.capacity} sharing · {r.type}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {r.facilities.slice(0, 3).map((f) => (
                        <Badge key={f} variant="outline" className="rounded-full text-[11px]">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="flex items-center text-sm font-semibold">
                        <IndianRupee className="size-3.5" />
                        {r.rent.toLocaleString("en-IN")}/yr
                      </span>
                      <Button
                        size="sm"
                        variant="soft"
                        disabled={free === 0}
                        onClick={() =>
                          toast.success(`Applied for room ${r.number}`, {
                            description: `${hostel.name} · request sent to the warden for approval.`,
                          })
                        }
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold">Facilities</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {hostel.facilities.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-accent" /> {f}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold">Current residents</h3>
            <ul className="mt-4 space-y-3">
              {residents.map((s) => (
                <li key={s.id} className="flex items-center gap-3">
                  <img src={s.avatar} alt="" className="size-9 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.dept} · Year {s.year} · Room {s.room}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h3 className="text-sm font-bold">Next step</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Complete the compatibility questionnaire before applying — matched pairs get priority
              in the same room.
            </p>
            <Button asChild variant="hero" className="mt-4 w-full">
              <Link to="/roommates">Find a roommate</Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link to="/hostels">Back to all hostels</Link>
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl bg-muted/60 p-3">
      <Icon className="size-4 text-primary" />
      <p className="font-display mt-1.5 text-xl font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
