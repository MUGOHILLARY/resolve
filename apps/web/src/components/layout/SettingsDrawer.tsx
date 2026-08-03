import {
  X,
  User,
  Bell,
  Shield,
  Palette,
  Bot,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDrawer({
  open,
  onClose,
}: Props) {

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 z-50 h-full w-96 border-l border-slate-800 bg-slate-950 p-6 shadow-2xl">

        <div className="mb-8 flex items-center justify-between">

          <h2 className="text-xl font-semibold text-white">
            Settings
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X size={20} />
          </button>

        </div>


        <div className="space-y-3">

          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-slate-300 hover:bg-slate-800">
            <User size={20} />
            Account
          </button>


          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-slate-300 hover:bg-slate-800">
            <Bell size={20} />
            Notifications
          </button>


          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-slate-300 hover:bg-slate-800">
            <Shield size={20} />
            Privacy
          </button>


          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-slate-300 hover:bg-slate-800">
            <Palette size={20} />
            Appearance
          </button>


          <button className="flex w-full items-center gap-3 rounded-xl p-4 text-left text-slate-300 hover:bg-slate-800">
            <Bot size={20} />
            AI Preferences
          </button>

        </div>

      </aside>
    </>
  );
}