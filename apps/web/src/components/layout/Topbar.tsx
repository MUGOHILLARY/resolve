import {
  Bell,
  Search,
  Settings,
} from "lucide-react";

import Greeting from "./Greeting";

export default function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-10 py-6">
      <Greeting />

      <div className="flex items-center gap-4">
        {/* Search */}
        <button className="flex items-center gap-4 rounded-2xl border border-slate-700 bg-slate-900 px-5 py-3 text-slate-400 transition hover:border-teal-500">
          <Search size={18} />

          <span>Search...</span>

          <span className="rounded-md border border-slate-600 px-2 py-1 text-xs">
            Ctrl K
          </span>
        </button>

        {/* Notifications */}
        <button className="rounded-2xl border border-slate-700 p-3 transition hover:border-teal-500 hover:text-teal-400">
          <Bell size={20} />
        </button>

        {/* Settings */}
        <button className="rounded-2xl border border-slate-700 p-3 transition hover:border-teal-500 hover:text-teal-400">
          <Settings size={20} />
        </button>

        {/* Avatar */}
        <button className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 font-bold text-slate-950">
          HK
        </button>
      </div>
    </header>
  );
}