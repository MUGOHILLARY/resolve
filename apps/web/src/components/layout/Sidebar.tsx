import SidebarBrand from "./SidebarBrand";
import SidebarNav from "./SidebarNav";
import RecoveryStatusCard from "./RecoveryStatusCard";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-800 bg-slate-950">
      <SidebarBrand />

      <SidebarNav />

      <div className="mb-6">
        <RecoveryStatusCard />
      </div>

      <SidebarFooter />
    </aside>
  );
}