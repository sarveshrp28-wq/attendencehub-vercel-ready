import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  CalendarDays,
  User,
  Settings,
  LogOut,
  BarChart3
} from "lucide-react";
import BrandLogo from "../BrandLogo";

const links = [
  { to: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/student/attendance", label: "My Attendance", icon: CalendarDays },
  { to: "/student/reports", label: "My Reports", icon: BarChart3 },
  { to: "/student/profile", label: "My Profile", icon: User },
  { to: "/student/settings", label: "Account", icon: Settings }
];

const StudentLayout = () => {
  const { signOut, student } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass-panel px-6 py-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between bg-gradient-to-r from-aqua-500/12 via-ink-800/65 to-sunrise-500/10">
        <div>
          <BrandLogo size="sm" />
          <h1 className="text-2xl font-semibold text-white">
            Welcome, {student?.name || "Student"}
          </h1>
        </div>
        <nav className="flex flex-wrap gap-2">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-gradient-to-r from-aqua-500/25 to-sunrise-500/20 text-white border border-aqua-500/35"
                    : "text-slate-300 hover:bg-white/5 border border-transparent"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <button className="btn-outline" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </nav>
      </header>
      <main className="flex-1 p-6 lg:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
