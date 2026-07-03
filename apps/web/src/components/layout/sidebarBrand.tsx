import { Shield } from "lucide-react";

export default function SidebarBrand() {
  return (
    <div className="border-b border-slate-800 px-6 py-8">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-lg shadow-teal-500/20">
          <Shield
            size={24}
            className="text-slate-950"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold tracking-wide text-white">
            Resolve
          </h1>

          <p className="text-sm text-slate-400">
            Digital Recovery Platform
          </p>
        </div>
      </div>
    </div>
  );
}