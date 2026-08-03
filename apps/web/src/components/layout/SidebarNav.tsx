import {
  LayoutDashboard,
  Brain,
  BookOpen,
  CalendarDays,
  Clock3,
  LineChart,
  Trophy,
  UserCircle,
  SlidersHorizontal,
  BarChart3,
  Bot,
  Shield,
  Settings,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const sections = [
  {
    title: "",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        path: "/",
      },
    ],
  },

  {
    title: "Recovery",
    items: [
      {
        label: "Overview",
        icon: Brain,
        path: "/recovery",
      },
      {
        label: "Journal",
        icon: BookOpen,
        path: "/recovery/journal",
      },
      {
        label: "Calendar",
        icon: CalendarDays,
        path: "/recovery/calendar",
      },
      {
        label: "Timeline",
        icon: Clock3,
        path: "/recovery/timeline",
      },
      {
        label: "Insights",
        icon: LineChart,
        path: "/recovery/insights",
      },
      {
        label: "Achievements",
        icon: Trophy,
        path: "/recovery/achievements",
      },
      {
        label: "Profile",
        icon: UserCircle,
        path: "/recovery/profile",
      },
      {
        label: "Recovery Policy",
        icon: SlidersHorizontal,
        path: "/recovery/policy",
      },
    ],
  },

  {
    title: "",
    items: [
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
    ],
  },
];

export default function SidebarNav() {
  return (
    <nav className="flex-1 overflow-y-auto px-4 py-6">
      {sections.map((section, index) => (
        <div
          key={index}
          className="mb-8"
        >
          {section.title && (
            <h2 className="mb-3 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </h2>
          )}

          <div className="space-y-2">
            {section.items.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/" || item.path === "/recovery"}
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
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}