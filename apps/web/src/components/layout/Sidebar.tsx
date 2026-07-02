import {
  LayoutDashboard,
  Waves,
  BarChart3,
  Bot,
  Shield,
  Settings,
  Flame,
} from "lucide-react";

const menu = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    icon: Waves,
    label: "Recovery",
  },
  {
    icon: BarChart3,
    label: "Analytics",
  },
  {
    icon: Bot,
    label: "AI Coach",
  },
  {
    icon: Shield,
    label: "Blocker",
  },
  {
    icon: Settings,
    label: "Settings",
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
            <button
              key={item.label}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-slate-300 transition hover:bg-teal-500/10 hover:text-teal-400"
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-5">
        <div className="rounded-2xl bg-teal-500/10 p-4">
          <div className="flex items-center gap-2 text-teal-400">
            <Flame size={20} />
            <span className="font-semibold">7 Day Streak</span>
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Keep going. Every day matters.
          </p>
        </div>
      </div>
    </aside>
  );
}