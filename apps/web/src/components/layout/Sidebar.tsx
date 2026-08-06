import {
  LayoutDashboard,
  HeartHandshake,
  BookOpen,
  User,
  Calendar,
  Clock3,
  Lightbulb,
  Trophy,
  ShieldCheck,
  BarChart3,
  Bot,
  Shield,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [recoveryOpen, setRecoveryOpen] = useState(true);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
      isActive
        ? "bg-teal-500 text-white shadow-lg"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  const subLinkClass = ({ isActive }: { isActive: boolean }) =>
    `ml-6 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? "bg-slate-800 text-teal-400"
        : "text-slate-400 hover:bg-slate-900 hover:text-white"
    }`;

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950">

      {/* Logo */}

      <div className="border-b border-slate-800 px-6 py-5">

        <div className="flex items-center gap-3">

          <img
            src="/resolve-logo.png"
            alt="Resolve"
            className="h-12 w-12 object-contain"
          />

          <div>
            <h1 className="text-xl font-bold text-white">
              Resolve
            </h1>

            <p className="text-xs text-slate-400">
              Recovery Platform
            </p>
          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto p-4 space-y-2">

        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>

        {/* Recovery Section */}

        <button
          onClick={() => setRecoveryOpen(!recoveryOpen)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-slate-300 hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <HeartHandshake size={20} />
            <span>Recovery</span>
          </div>

          {recoveryOpen ? (
            <ChevronDown size={18} />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>

        {recoveryOpen && (
          <div className="space-y-1">

            <NavLink
              to="/recovery"
              end
              className={subLinkClass}
            >
              <HeartHandshake size={16} />
              Overview
            </NavLink>

            <NavLink
              to="/recovery/journal"
              className={subLinkClass}
            >
              <BookOpen size={16} />
              Journal
            </NavLink>

            <NavLink
              to="/recovery/profile"
              className={subLinkClass}
            >
              <User size={16} />
              Profile
            </NavLink>

            <NavLink
              to="/recovery/calendar"
              className={subLinkClass}
            >
              <Calendar size={16} />
              Calendar
            </NavLink>

            <NavLink
              to="/recovery/timeline"
              className={subLinkClass}
            >
              <Clock3 size={16} />
              Timeline
            </NavLink>

            <NavLink
              to="/recovery/insights"
              className={subLinkClass}
            >
              <Lightbulb size={16} />
              Insights
            </NavLink>

            <NavLink
              to="/recovery/achievements"
              className={subLinkClass}
            >
              <Trophy size={16} />
              Achievements
            </NavLink>

            <NavLink
              to="/recovery/policy"
              className={subLinkClass}
            >
              <ShieldCheck size={16} />
              Recovery Policy
            </NavLink>

          </div>
        )}

        <NavLink
          to="/analytics"
          className={linkClass}
        >
          <BarChart3 size={20} />
          Analytics
        </NavLink>

        <NavLink
          to="/ai-coach"
          className={linkClass}
        >
          <Bot size={20} />
          AI Coach
        </NavLink>

        <NavLink
          to="/blocker"
          className={linkClass}
        >
          <Shield size={20} />
          Website Blocker
        </NavLink>

        <NavLink
          to="/settings"
          className={linkClass}
        >
          <Settings size={20} />
          Settings
        </NavLink>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />
          Logout
        </button>

      </div>

    </aside>
  );
}