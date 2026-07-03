import StreakFlame from "../dashboard/StreakFlame";
import {
  LayoutDashboard,
  Waves,
  BarChart3,
  Bot,
  Shield,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const menu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    path: "/",
  },
  {
    icon: Waves,
    label: "Recovery",
    path: "/recovery",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    path: "/analytics",
  },
  {
    icon: Bot,
    label: "AI Coach",
    path: "/ai-coach",
  },
  {
    icon: Shield,
    label: "Blocker",
    path: "/blocker",
  },
  {
    icon: Settings,
    label: "Settings",
    path: "/settings",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex w-72 flex-col border-r border-slate-800 bg-slate-900">
      <div className="border-b border-slate-800 p-6">
        <h1 className="text-3xl font-bold text-teal-400">
          Resolve
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Digital Recovery Platform
        </p>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.label}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-teal-500 text-slate-950 font-semibold"
                    : "text-slate-300 hover:bg-teal-500/10 hover:text-teal-400"
                }`
              }
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-5">
  <div className="rounded-2xl bg-teal-500/10 p-4">
    <StreakFlame />

    <p className="mt-2 text-sm text-slate-400">
      Keep going. Every day matters.
    </p>
  </div>
</div>
    </aside>
  );
}