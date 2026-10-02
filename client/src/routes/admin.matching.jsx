import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Heart, Sparkles, UserCheck } from "lucide-react";
import { matches as mockMatches } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/matching")({
  head: () => ({
    meta: [
      { title: "Roommate Matching · BIT Admin Portal" },
      {
        name: "description",
        content: "View student compatibility matching algorithms, roommate pairs and priority allocations.",
      },
    ],
  }),
  component: RoommateMatchingPage,
});

function RoommateMatchingPage() {
  const [matchesList, setMatchesList] = useState(mockMatches);

  const handleAutoMatch = () => {
    toast.success("Compatibility Algorithm Executed", {
      description: "Auto-matched 14 high compatibility student pairs for next semester room allocation.",
    });
  };

  return (
    <AppShell
      title="Roommate Matching & Compatibility Desk"
      breadcrumb={["Admin", "Matching"]}
      actions={
        <Button variant="hero" onClick={handleAutoMatch}>
          <Sparkles className="mr-1.5 size-4" /> Run Auto-Match Algorithm
        </Button>
      }
    >
      <div className="grid gap-5">
        <section className="rounded-2xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Heart className="size-5 text-primary" /> High-Compatibility Student Pairings
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Matches are calculated based on sleep schedule, cleanliness index, study habits, and department compatibility.
          </p>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {matchesList.map((m) => (
              <div
                key={m.id}
                className="rounded-2xl border p-4 shadow-soft transition-all hover:shadow-elegant"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <Badge variant="hero" className="px-2.5 py-1 text-xs">
                    {m.compatibility}% Compatibility
                  </Badge>
                  <span className="text-xs text-muted-foreground">{m.hometown}</span>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <img src={m.avatar} alt={m.name} className="size-12 rounded-2xl object-cover" />
                  <div>
                    <p className="font-bold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.dept} · Year {m.year}</p>
                    <p className="text-xs font-mono text-muted-foreground">{m.regNo}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs bg-muted/50 p-3 rounded-xl">
                  <p><span className="text-muted-foreground">Sleep:</span> {m.traits.sleep}</p>
                  <p><span className="text-muted-foreground">Food:</span> {m.traits.food}</p>
                  <p><span className="text-muted-foreground">Noise level:</span> {m.traits.noise}</p>
                </div>

                <Button
                  variant="soft"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() =>
                    toast.success(`Allocated room for ${m.name}`, {
                      description: `Paired successfully in same room with priority status.`,
                    })
                  }
                >
                  <UserCheck className="mr-1.5 size-3.5" /> Approve Pair Allocation
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
