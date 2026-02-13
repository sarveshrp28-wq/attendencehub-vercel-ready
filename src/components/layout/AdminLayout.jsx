import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  CalendarCheck,
  BarChart3,
  LogOut
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import BrandLogo from "../BrandLogo";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/attendance", label: "Mark Attendance", icon: ClipboardCheck },
  { to: "/admin/attendance/history", label: "Attendance Logs", icon: CalendarCheck },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 }
];

const AdminLayout = () => {
  const { signOut, user } = useAuth();

  return (
    <div className="min-h-screen grid lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:flex flex-col gap-6 p-6 bg-gradient-to-b from-ink-800/90 via-ink-800/80 to-ink-900/85 border-r border-white/10">
        <div>
          <BrandLogo size="sm" />
          <h1 className="text-2xl font-semibold text-white mt-2">
            Admin Console
          </h1>
        </div>
        <nav className="flex flex-col gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-aqua-500/25 to-sunrise-500/20 text-white border border-aqua-500/35"
                    : "text-slate-300 hover:bg-white/5 hover:border-white/15 border border-transparent"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto glass-panel p-4">
          <p className="text-xs text-slate-400">Signed in as</p>
          <p className="text-sm font-semibold text-white">{user?.email}</p>
          <button
            className="btn-outline mt-3 w-full"
            onClick={() => signOut()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="p-6 lg:p-10">
        <div className="lg:hidden mb-6 glass-panel p-4 flex items-center justify-between">
          <div>
            <BrandLogo size="sm" />
            <p className="text-lg font-semibold text-white">Admin Console</p>
          </div>
          <button className="btn-outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
