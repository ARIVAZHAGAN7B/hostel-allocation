import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useNotifications, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Read hostel, mess, academic and payment announcements from wardens and administrators.",
      },
      { property: "og:title", content: "Notifications · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Read hostel, mess, academic and payment announcements from wardens and administrators.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const { data: notificationData = [] } = useNotifications({ regNo: student.regNo });
  const list = Array.isArray(notificationData) ? notificationData : [];
  return (
    <AppShell
      title="Notifications"
      breadcrumb={["Notifications"]}
      actions={
        <Button variant="outline" onClick={() => toast.success("All notifications marked as read")}>
          Mark all as read
        </Button>
      }
    >
      <div className="space-y-3">
        {list.map((n) => (
          <article
            key={n.id}
            className={`flex gap-4 rounded-2xl border bg-card p-5 shadow-soft ${!n.read ? "border-primary/40" : ""}`}
          >
            <span
              className="mt-1 size-2.5 shrink-0 rounded-full"
              style={{
                background: n.read ? "var(--color-muted-foreground)" : "var(--color-primary)",
              }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold">{n.title}</p>
                <Badge variant="outline">{n.category}</Badge>
                {!n.read && <Badge variant="secondary">Unread</Badge>}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-1 text-xs text-muted-foreground">{n.date}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => toast("Marked as read")}>
              Mark read
            </Button>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
