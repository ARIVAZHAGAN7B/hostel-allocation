import { Link } from "@tanstack/react-router";
import { Facebook, Github, Instagram, Linkedin, Twitter } from "lucide-react";
export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <img
              src="/bit-logo.png"
              alt="BIT Logo"
              className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-soft"
            />
            <span className="font-display font-extrabold">BIT Hostel Portal</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Bannari Amman Institute of Technology, Sathyamangalam — Erode District, Tamil Nadu
            638401.
          </p>
          <div className="mt-5 flex gap-2">
            {[Facebook, Twitter, Instagram, Linkedin, Github].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={`Social link ${i + 1}`}
                className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        <FooterCol
          title="Portal"
          items={[
            ["Hostels", "/hostels"],
            ["Roommate Match", "/roommates"],
            ["Apply for Hostel", "/apply"],
            ["Student Dashboard", "/dashboard"],
          ]}
        />
        <FooterCol
          title="Support"
          items={[
            ["Complaints", "/complaints"],
            ["Attendance", "/attendance"],
            ["Fee Payment", "/payments"],
            ["Notifications", "/notifications"],
          ]}
        />
        <FooterCol
          title="Institution"
          items={[
            ["About", "/about"],
            ["Contact", "/contact"],
            ["Privacy Policy", "/privacy"],
            ["Terms of Use", "/terms"],
          ]}
        />
      </div>
      <div className="border-t px-5 py-5 text-center text-xs text-muted-foreground">
        © 2026 Bannari Amman Institute of Technology · Hostel Allocation & Roommate Matchmaking
        Portal
      </div>
    </footer>
  );
}
function FooterCol({ title, items }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
        {items.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="transition-colors hover:text-primary">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
