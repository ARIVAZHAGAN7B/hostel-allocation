import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { usePayments, useCurrentUser } from "@/hooks/use-hostel-api";

export const Route = createFileRoute("/payments")({
  head: () => ({
    meta: [
      { title: "Fee Payment · BIT Hostel Portal" },
      {
        name: "description",
        content: "Check hostel fee dues, payment history and download receipts.",
      },
      { property: "og:title", content: "Fee Payment · BIT Hostel Portal" },
      {
        property: "og:description",
        content: "Check hostel fee dues, payment history and download receipts.",
      },
    ],
  }),
  component: Page,
});

function Page() {
  const { data: user } = useCurrentUser();
  const student = user || {};

  const { data: paymentsData = [] } = usePayments({ regNo: student.regNo });
  const mine = Array.isArray(paymentsData) ? paymentsData : [];

  const pending = mine
    .filter((p) => p.status !== "Paid")
    .reduce((a, p) => a + (p.amount - p.paid), 0);
  const paid = mine.reduce((a, p) => a + p.paid, 0);
  return (
    <AppShell
      title="Fee payment"
      breadcrumb={["Payments"]}
      actions={
        <Button variant="hero" onClick={() => toast.success("Redirecting to payment gateway")}>
          Pay now
        </Button>
      }
    >
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          ["Pending amount", pending],
          ["Paid this year", paid],
          ["Transactions", mine.length],
        ].map(([l, v], i) => (
          <div key={l} className="rounded-2xl border bg-card p-5 shadow-soft">
            <p className="text-sm text-muted-foreground">{l}</p>
            <p className="font-display mt-2 text-3xl font-extrabold">
              {i === 2 ? v : `₹${v.toLocaleString("en-IN")}`}
            </p>
          </div>
        ))}
      </div>
      <section className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
            <tr>
              {["Receipt", "Term", "Amount", "Paid", "Mode", "Date", "Status", ""].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mine.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-3 font-medium">{p.id}</td>
                <td className="px-4 py-3">{p.term}</td>
                <td className="px-4 py-3">₹{p.amount.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">₹{p.paid.toLocaleString("en-IN")}</td>
                <td className="px-4 py-3">{p.mode}</td>
                <td className="px-4 py-3">{p.date}</td>
                <td className="px-4 py-3">
                  <Badge variant={p.status === "Paid" ? "default" : "secondary"}>{p.status}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toast.success("Receipt downloaded")}
                  >
                    Receipt
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </AppShell>
  );
}
