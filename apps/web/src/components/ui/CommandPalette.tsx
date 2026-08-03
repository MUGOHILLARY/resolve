import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CommandPalette({
  open,
  onOpenChange,
}: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }

      if (e.key === "Escape") {
        onOpenChange(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function go(path: string) {
    navigate(path);
    onOpenChange(false);
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">

        <Command>
          <Command.Input
            autoFocus
            placeholder="Search Resolve..."
            className="w-full rounded-xl bg-slate-800 p-4 text-white outline-none"
          />

          <Command.List className="mt-4 max-h-96 overflow-y-auto">

            <Command.Empty className="p-4 text-slate-400">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation">

              <Command.Item
                onSelect={() => go("/")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Dashboard
              </Command.Item>

              <Command.Item
                onSelect={() => go("/recovery")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Recovery
              </Command.Item>

              <Command.Item
                onSelect={() => go("/recovery/policy")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Recovery Policy
              </Command.Item>

              <Command.Item
                onSelect={() => go("/analytics")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Analytics
              </Command.Item>

              <Command.Item
                onSelect={() => go("/ai-coach")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                AI Coach
              </Command.Item>

              <Command.Item
                onSelect={() => go("/blocker")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Blocker
              </Command.Item>

              <Command.Item
                onSelect={() => go("/settings")}
                className="cursor-pointer rounded-lg p-3 hover:bg-slate-800"
              >
                Settings
              </Command.Item>

            </Command.Group>

          </Command.List>
        </Command>

      </div>
    </>
  );
}