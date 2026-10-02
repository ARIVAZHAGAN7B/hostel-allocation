import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useComplaints, useCreateComplaint, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/complaints")({
  head: () => ({
    meta: [
      { title: "Complaint Management · BIT Hostel Portal" },
      {
        name: "description",
        content:
          "Raise hostel complaints for electricity, water, internet, furniture or cleaning and track resolution.",
      },
      { property: "og:title", content: "Complaint Management · BIT Hostel Portal" },
      {
        property: "og:description",
        content:
          "Raise hostel complaints for electricity, water, internet, furniture or cleaning and track resolution.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const { data: complaintsData = [] } = useComplaints({ regNo: student.regNo });
  const createMutation = useCreateComplaint();

  const [category, setCategory] = useState("Electricity");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Medium");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title) {
      toast.error("Please enter a title for the complaint");
      return;
    }

    createMutation.mutate(
      {
        student: student.name || "Student",
        regNo: student.regNo || "7376242AD142",
        category,
        title,
        hostel: student.hostel || "Sapphire Block",
        room: student.room || "312",
        priority,
      },
      {
        onSuccess: () => {
          toast.success("Complaint registered", {
            description:
              "Your complaint has been saved into MongoDB. You will be notified when staff is assigned.",
          });
          setTitle("");
          setDescription("");
        },
      },
    );
  };

  const mine = Array.isArray(complaintsData) ? complaintsData : [];

  return (
    <AppShell title="Complaint management" breadcrumb={["Complaints"]}>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.3fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border bg-card p-6 shadow-soft"
        >
          <h2 className="text-lg font-bold">Raise a complaint</h2>
          <div className="space-y-2">
            <Label>Category</Label>
            <div className="grid grid-cols-3 gap-2">
              {["Electricity", "Water", "Internet", "Furniture", "Cleaning", "Others"].map((c) => (
                <label
                  key={c}
                  className={`cursor-pointer rounded-xl border px-2 py-2 text-center text-xs font-medium transition-colors ${category === c ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/50"}`}
                >
                  <input
                    type="radio"
                    name="cat"
                    checked={category === c}
                    onChange={() => setCategory(c)}
                    className="sr-only"
                  />{" "}
                  {c}
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tube light not working"
            />
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
            />
          </div>
          <div className="space-y-2">
            <Label>Priority</Label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm"
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-dashed px-4 py-3 text-sm">
            <span>Attach images</span>
            <span className="text-xs font-semibold text-primary">Upload</span>
            <input type="file" multiple className="sr-only" />
          </label>
          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Submitting..." : "Submit complaint"}
          </Button>
        </form>

        <section className="rounded-2xl border bg-card p-5 shadow-soft">
          <h2 className="text-lg font-bold">My complaints</h2>
          <ul className="mt-4 space-y-3">
            {mine.map((c) => (
              <li key={c.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{c.title}</p>
                  <Badge variant="outline">{c.category}</Badge>
                  <Badge variant={c.priority === "High" ? "destructive" : "secondary"}>
                    {c.priority}
                  </Badge>
                  <Badge
                    className="ml-auto"
                    variant={c.status === "Resolved" ? "default" : "secondary"}
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {c.id} · {c.hostel} · Room {c.room} · raised {c.createdAt} · {c.assignedTo}
                </p>
                <Progress
                  value={c.status === "Resolved" ? 100 : c.status === "In Progress" ? 60 : 25}
                  className="mt-3"
                />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
