import {
  LayoutDashboard,
  Waves,
  BarChart3,
  Bot,
  Shield,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const links = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    label: "Recovery",
    icon: Waves,
    path: "/recovery",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "AI Coach",
    icon: Bot,
    path: "/ai-coach",
  },
  {
    label: "Blocker",
    icon: Shield,
    path: "/blocker",
  },
  {
    label: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function SidebarNav() {
  return (
    <nav className="flex-1 px-4 py-6">
      <div className="space-y-2">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === "/"}
              className={({ isActive }) =>
                `group flex items-center gap-4 rounded-2xl px-4 py-3 transition-all duration-300 ${
                  isActive
                    ? "bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon
                size={20}
                className="transition-transform duration-300 group-hover:scale-110"
              />

              <span className="font-medium">
                {link.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}