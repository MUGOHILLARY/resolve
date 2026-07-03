import { Bell, Search } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-800 bg-slate-950 px-8">
      <div>
        <h2 className="text-2xl font-bold text-white">
          Dashboard
        </h2>

        <p className="text-sm text-slate-400">
          Welcome back, Hillary 👋
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button className="rounded-xl border border-slate-800 p-3 transition hover:border-teal-500 hover:text-teal-400">
          <Search size={20} />
        </button>

        <button className="rounded-xl border border-slate-800 p-3 transition hover:border-teal-500 hover:text-teal-400">
          <Bell size={20} />
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-500 font-bold text-slate-950">
          HK
        </div>
      </div>
    </header>
  );
}