import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { 
  Bell,
  BedDouble,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileBarChart,
  Heart,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Repeat,
  Search,
  Settings,
  Users,
  UserCircle,
  Wrench,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { currentStudent as fallbackStudent, notifications } from "@/lib/mock-data";
import { useCurrentUser } from "@/hooks/use-hostel-api";
import { cn } from "@/lib/utils";
const studentNav = [
  {
    group: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/notifications", label: "Notifications", icon: Bell },
      { to: "/profile", label: "My Profile", icon: UserCircle },
    ],
  },
  {
    group: "Hostel",
    items: [
      { to: "/apply", label: "Hostel Application", icon: ClipboardList },
      { to: "/hostels", label: "Hostel Availability", icon: Building2 },
      { to: "/room-change", label: "Room Change", icon: Repeat },
    ],
  },
  {
    group: "Roommates",
    items: [
      { to: "/roommates", label: "Compatibility Match", icon: Heart },
      { to: "/requests", label: "Requests & Chat", icon: MessageSquare },
    ],
  },
  {
    group: "Services",
    items: [
      { to: "/complaints", label: "Complaints", icon: Wrench },
      { to: "/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/payments", label: "Fee Payment", icon: CreditCard },
    ],
  },
];
const adminNav = [
  {
    group: "Overview",
    items: [{ to: "/admin", label: "Admin Dashboard", icon: LayoutDashboard }],
  },
  {
    group: "Management",
    items: [
      { to: "/admin/students", label: "Student Management", icon: Users },
      { to: "/admin/hostels", label: "Hostel Management", icon: Building2 },
      { to: "/admin/allocation", label: "Room Allocation", icon: BedDouble },
      { to: "/admin/matching", label: "Roommate Matching", icon: Heart },
    ],
  },
  {
    group: "Operations",
    items: [
      { to: "/admin/complaints", label: "Complaint Desk", icon: Wrench },
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/admin/reports", label: "Reports", icon: FileBarChart },
    ],
  },
];
const wardenNav = [
  {
    group: "Warden",
    items: [
      { to: "/warden", label: "Warden Dashboard", icon: LayoutDashboard },
      { to: "/admin/complaints", label: "Complaints", icon: Wrench },
      { to: "/admin/attendance", label: "Attendance", icon: CalendarCheck },
      { to: "/hostels", label: "Occupancy", icon: Building2 },
    ],
  },
];
export function AppShell({ role = "student", title, breadcrumb, actions, children }) {
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: user } = useCurrentUser();
  const currentUser = user || fallbackStudent;

  const activeRole = currentUser.role || (
    currentUser.regNo === "admin123"
      ? "admin"
      : currentUser.regNo === "warden123" || currentUser.regNo === "gwarden123"
        ? "warden"
        : role
  );

  const isGirlsWarden = currentUser.wardenType === "Girls" || currentUser.regNo === "gwarden123";
  const avatarUrl =
    currentUser.avatar ||
    (activeRole === "admin"
      ? "https://i.pravatar.cc/160?img=60"
      : isGirlsWarden
        ? "https://i.pravatar.cc/160?img=47"
        : activeRole === "warden"
          ? "https://i.pravatar.cc/160?img=68"
          : "https://i.pravatar.cc/160?img=12");

  const displayName = currentUser.name || "User";
  const displaySubtext = currentUser.regNo || currentUser.email || "";

  const nav = activeRole === "admin" ? adminNav : activeRole === "warden" ? wardenNav : studentNav;
  const unread = notifications.filter((n) => !n.read).length;
  const sidebar = (
    <div className="flex h-full flex-col">
      <Link to="/dashboard" className="flex items-center gap-2.5 px-5 py-5">
        <img
          src="/bit-logo.png"
          alt="BIT Logo"
          className="h-10 w-auto object-contain bg-white rounded-xl p-1 shadow-soft"
        />
        <span className="font-display text-sm leading-tight font-extrabold">
          BIT Hostel
          <span className="block text-[11px] font-medium text-muted-foreground capitalize">
            {activeRole} portal
          </span>
        </span>
      </Link>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-6">
        {nav.map((section) => (
          <div key={section.group}>
            <p className="px-3 pb-2 text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
              {section.group}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="gradient-primary absolute left-0 h-6 w-1 rounded-r-full"
                      />
                    )}
                    <item.icon className="size-4.5 shrink-0" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className="flex items-center gap-3 rounded-xl p-2">
          <img src={avatarUrl} alt="" className="size-9 rounded-full object-cover" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            <p className="truncate text-xs text-muted-foreground">{displaySubtext}</p>
          </div>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Sign out"
            onClick={() => {
              if (typeof window !== "undefined") {
                localStorage.removeItem("bit_auth_token");
                localStorage.removeItem("bit_user");
              }
            }}
          >
            <Link to="/login">
              <LogOut className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar lg:block">
        {sidebar}
      </aside>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 26, stiffness: 240 }}
              className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-sidebar lg:hidden"
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close menu"
                className="absolute top-4 right-2"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </Button>
              {sidebar}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="glass sticky top-0 z-30 border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              aria-label="Open menu"
              onClick={() => setOpen(true)}
            >
              <Menu className="size-5" />
            </Button>

            <div className="relative hidden max-w-sm flex-1 md:block">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search students, rooms, complaints…"
                className="pl-9"
                aria-label="Global search"
              />
            </div>

            <div className="ml-auto flex items-center gap-1">
              <ThemeToggle />
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative"
                aria-label="Notifications"
              >
                <Link to="/notifications">
                  <Bell className="size-5" />
                  {unread > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                      {unread > 9 ? "9+" : unread}
                    </span>
                  )}
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="ml-1 flex items-center gap-2 rounded-full border p-1 pr-3 transition-colors hover:bg-muted"
                    aria-label="Account menu"
                  >
                    <img src={avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                    <span className="hidden text-sm font-medium sm:block">
                      {displayName.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="text-sm font-semibold">{displayName}</p>
                    <p className="text-xs font-normal text-muted-foreground">
                      {currentUser.email || displaySubtext}
                    </p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <UserCircle className="mr-2 size-4" /> My profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/notifications">
                      <Settings className="mr-2 size-4" /> Preferences
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("bit_auth_token");
                        localStorage.removeItem("bit_user");
                      }
                    }}
                  >
                    <Link to="/login">
                      <LogOut className="mr-2 size-4" /> Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl"
          >
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <nav
                  aria-label="Breadcrumb"
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <Link to="/dashboard" className="hover:text-primary">
                    Home
                  </Link>
                  {(breadcrumb ?? [title]).map((b) => (
                    <span key={b} className="flex items-center gap-1.5">
                      <span>/</span>
                      <span className="text-foreground">{b}</span>
                    </span>
                  ))}
                </nav>
                <h1 className="mt-1.5 text-2xl font-extrabold sm:text-3xl">{title}</h1>
              </div>
              {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
            </div>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
export function StatCard({ icon: Icon, label, value, trend, tone = "primary" }) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    accent: "bg-accent/15 text-accent",
    warning: "bg-warning/15 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="rounded-2xl border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className="flex items-start justify-between">
        <span className={cn("flex size-11 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-5" />
        </span>
        {trend && (
          <Badge variant="secondary" className="rounded-full text-[11px]">
            {trend}
          </Badge>
        )}
      </div>
      <p className="font-display mt-4 text-3xl font-extrabold">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}
