import { Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UserCog,
  Users,
  History,
  FileText,
  Pill,
} from "lucide-react";
import { useState } from "react";
import Sidebar, { type NavItem } from "../components/Sidebar";
import Topbar from "../components/Topbar";

const NAV: NavItem[] = [
  { to: "/doctor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/doctor/profile", label: "My Profile", icon: UserCog },
  { to: "/doctor/patients", label: "Find Patients", icon: Users },
  { to: "/doctor/access-history", label: "Access History", icon: History },
  { to: "/doctor/reports", label: "Reports", icon: FileText },
  { to: "/doctor/prescriptions", label: "Prescriptions", icon: Pill },
];

function titleFor(pathname: string) {
  return NAV.find((n) => pathname.startsWith(n.to))?.label ?? "MediVault";
}

export default function DoctorLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-screen bg-muted/30">
      <div className="hidden md:block">
        <Sidebar items={NAV} />
      </div>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-y-0 left-0" onClick={(e) => e.stopPropagation()}>
            <Sidebar items={NAV} onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileOpen(true)} title={titleFor(pathname)} />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}