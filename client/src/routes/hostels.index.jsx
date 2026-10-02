import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Building2, Filter, Search, Users } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useHostels, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/hostels/")({
  head: () => ({
    meta: [
      { title: "Hostel Availability · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Browse all 13 BIT hostel blocks with live room availability, occupancy, floors and facilities.",
      },
      { property: "og:title", content: "Hostel Availability · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Search, filter and compare boys and girls hostel blocks before you apply.",
      },
    ],
  }),
  component: HostelsPage,
});

function HostelsPage() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const isAdmin = student.role === "admin" || student.regNo === "admin123";
  const isGirlsUser =
    !isAdmin &&
    (student.wardenType === "Girls" ||
      student.regNo === "gwarden123" ||
      student.gender?.toLowerCase() === "female");
  const isBoysUser =
    !isAdmin &&
    !isGirlsUser &&
    (student.wardenType === "Boys" ||
      student.regNo === "warden123" ||
      student.gender?.toLowerCase() === "male" ||
      true);

  const enforcedType = isAdmin ? null : isGirlsUser ? "Girls" : "Boys";

  const [q, setQ] = useState("");
  const [type, setType] = useState(enforcedType || "All");
  const [sort, setSort] = useState("availability");

  const activeType = enforcedType || type;
  const { data: hostelsData = [] } = useHostels(activeType, q);

  const list = useMemo(() => {
    let l = Array.isArray(hostelsData) ? hostelsData : [];
    if (enforcedType) {
      l = l.filter((h) => h.type === enforcedType);
    } else if (type && type !== "All") {
      l = l.filter((h) => h.type === type);
    }
    l = [...l].sort((a, b) =>
      sort === "availability"
        ? b.capacity - b.occupied - (a.capacity - a.occupied)
        : sort === "capacity"
          ? b.capacity - a.capacity
          : a.name.localeCompare(b.name),
    );
    return l;
  }, [hostelsData, sort, enforcedType, type]);
  return (
    <AppShell
      title="Hostel availability"
      breadcrumb={["Hostels"]}
      actions={
        <Button asChild variant="hero">
          <Link to="/apply">Apply for hostel</Link>
        </Button>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="relative min-w-56 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search hostel block"
            className="pl-9"
            aria-label="Search hostels"
          />
        </div>
        {isAdmin ? (
          <div className="flex gap-1 rounded-xl bg-muted p-1">
            {["All", "Boys", "Girls"].map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${type === t ? "bg-card text-primary shadow-soft" : "text-muted-foreground"}`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center rounded-xl bg-muted px-3 py-1.5 text-xs font-semibold text-primary">
            {enforcedType === "Girls" ? "Girls Hostels Only" : "Boys Hostels Only"}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-muted-foreground" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort hostels"
            className="h-9 rounded-xl border border-input bg-background px-3 text-sm"
          >
            <option value="availability">Most available</option>
            <option value="capacity">Largest capacity</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((h, i) => {
          const available = h.capacity - h.occupied;
          const pct = Math.round((h.occupied / h.capacity) * 100);
          return (
            <motion.article
              key={h.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="relative h-36 overflow-hidden bg-muted">
                <img
                  src={h.image}
                  alt={h.name}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <Badge
                  className="absolute top-3 left-3"
                  variant={h.type === "Boys" ? "default" : "secondary"}
                >
                  {h.type}
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

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <Mini label="Available" value={available} tone="text-accent" />
                  <Mini label="Occupied" value={h.occupied} tone="text-primary" />
                  <Mini label="Capacity" value={h.capacity} />
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Occupancy</span>
                    <span className="font-semibold text-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="mt-1.5" />
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {h.facilities.slice(0, 4).map((f) => (
                    <Badge key={f} variant="outline" className="rounded-full text-[11px]">
                      {f}
                    </Badge>
                  ))}
                </div>

                <Button asChild variant="soft" className="mt-5 w-full">
                  <Link to="/hostels/$hostelId" params={{ hostelId: h.id }}>
                    View details
                  </Link>
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>

      {list.length === 0 && (
        <div className="rounded-2xl border border-dashed p-14 text-center">
          <Users className="mx-auto size-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No hostels match your filters</p>
          <p className="text-sm text-muted-foreground">
            Try a different search term or block type.
          </p>
        </div>
      )}
    </AppShell>
  );
}
function Mini({ label, value, tone }) {
  return (
    <div className="rounded-xl bg-muted/60 py-2">
      <p className={`font-display text-lg font-bold ${tone ?? ""}`}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}
