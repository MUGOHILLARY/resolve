import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
} from "cmdk";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((value) => !value);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(path: string) {
    navigate(path);
    setOpen(false);
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command Palette"
      className="fixed left-1/2 top-24 z-50 w-full max-w-xl -translate-x-1/2 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl"
    >
      <Command.Input
        placeholder="Search commands..."
        className="w-full rounded-xl bg-slate-800 p-3 text-white outline-none"
      />

      <Command.List className="mt-4 space-y-2">
        <Command.Empty>No results found.</Command.Empty>

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
      </Command.List>
    </Command.Dialog>
  );
}