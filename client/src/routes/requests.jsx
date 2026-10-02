import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRoommateMatches, useSendRoommateRequest, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Roommate Requests · BIT Hostel Portal" },
      {
        name: "description",
        content: "Manage incoming and outgoing roommate requests and start a chat with your match.",
      },
      { property: "og:title", content: "Roommate Requests · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Manage incoming and outgoing roommate requests and start a chat with your match.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const currentStudent = user || {};

  const { data: matchesData = [] } = useRoommateMatches({ regNo: currentStudent.regNo });
  const sendMutation = useSendRoommateRequest();

  const matchesList = Array.isArray(matchesData) ? matchesData : [];

  const incoming = matchesList.filter((m) => m.status === "Requested" || m.status === "Pending").slice(0, 4);
  const outgoing = matchesList.filter((m) => m.status === "Accepted").slice(0, 4);
  const suggested = matchesList.filter((m) => m.status === "Suggested" || !m.status).slice(0, 4);

  const handleAction = (targetRegNo, targetName, status) => {
    sendMutation.mutate(
      {
        requesterRegNo: currentStudent.regNo || "7376242AD142",
        targetRegNo,
        status,
      },
      {
        onSuccess: () => {
          toast.success(`Request ${status}`, {
            description: `Roommate request status for ${targetName} updated in MongoDB.`,
          });
        },
      },
    );
  };

  return (
    <AppShell title="Roommate requests" breadcrumb={["Requests"]}>
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold">Incoming & Active Requests</h2>
          <ul className="mt-4 space-y-3">
            {(incoming.length > 0 ? incoming : suggested).map((m) => (
              <li
                key={m.matchId || m.regNo}
                className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
              >
                <img src={m.avatar || "https://i.pravatar.cc/160?img=1"} alt="" className="size-11 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{m.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {m.dept || m.department} · Year {m.year}
                  </p>
                </div>
                <Badge variant="secondary">{m.compatibility || 85}%</Badge>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    disabled={sendMutation.isPending}
                    onClick={() => handleAction(m.regNo, m.name, "Accepted")}
                  >
                    Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={sendMutation.isPending}
                    onClick={() => handleAction(m.regNo, m.name, "Rejected")}
                  >
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold">Accepted & Connected Matches</h2>
          <ul className="mt-4 space-y-3">
            {outgoing.length > 0 ? (
              outgoing.map((m) => (
                <li
                  key={m.matchId || m.regNo}
                  className="flex flex-wrap items-center gap-3 rounded-xl border p-3"
                >
                  <img src={m.avatar || "https://i.pravatar.cc/160?img=2"} alt="" className="size-11 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.dept || m.department} · Year {m.year}
                    </p>
                  </div>
                  <Badge variant="default">Accepted</Badge>
                  <Button
                    size="sm"
                    variant="soft"
                    onClick={() =>
                      toast("Chat session started", {
                        description: `Direct message channel opened with ${m.name}.`,
                      })
                    }
                  >
                    Chat
                  </Button>
                </li>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No accepted roommate requests yet. Send requests from the Find Roommate matchmaking page!
              </div>
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
