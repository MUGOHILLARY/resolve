import {
  LayoutDashboard,
  HeartHandshake,
  BarChart3,
  Bot,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

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

      <nav className="flex-1 space-y-2 p-4">

        <NavLink
          to="/"
          end
          className={linkClass}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/recovery"
          className={linkClass}
        >
          <HeartHandshake size={20} />
          <span>Recovery</span>
        </NavLink>

        <NavLink
          to="/analytics"
          className={linkClass}
        >
          <BarChart3 size={20} />
          <span>Analytics</span>
        </NavLink>

        <NavLink
          to="/ai-coach"
          className={linkClass}
        >
          <Bot size={20} />
          <span>AI Coach</span>
        </NavLink>

        <NavLink
          to="/blocker"
          className={linkClass}
        >
          <Shield size={20} />
          <span>Website Blocker</span>
        </NavLink>

        <NavLink
          to="/settings"
          className={linkClass}
        >
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-800 p-4">

        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white"
        >
          <LogOut size={20} />

          <span>Logout</span>

        </button>

      </div>

    </aside>
  );
}