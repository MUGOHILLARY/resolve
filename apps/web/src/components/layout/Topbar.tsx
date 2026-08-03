import {
  Search,
  Settings,
} from "lucide-react";

import Greeting from "./Greeting";

import NotificationButton from "../topbar/NotificationButton";
import UserMenu from "../topbar/UserMenu";

type TopbarProps = {
  onOpenSearch: () => void;
  onOpenSettings: () => void;
};

export default function Topbar({
  onOpenSearch,
  onOpenSettings,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">

      <div className="flex h-20 items-center justify-between px-8">

        {/* Left Section */}

        <div className="flex items-center gap-5">

          <img
            src="/resolve-logo.png"
            alt="Resolve"
            className="h-12 w-12 object-contain"
          />

          <Greeting />

        </div>

        {/* Right Section */}

        <div className="flex items-center gap-3">

          {/* Search */}

          <button
            onClick={onOpenSearch}
            title="Search"
            className="rounded-xl bg-slate-900 p-3 transition-all duration-200 hover:scale-105 hover:bg-slate-800"
          >
            <Search
              size={20}
              className="text-slate-300"
            />
          </button>

          {/* Notifications */}

          <NotificationButton />

          {/* Settings */}

          <button
            onClick={onOpenSettings}
            title="Settings"
            className="rounded-xl bg-slate-900 p-3 transition-all duration-200 hover:scale-105 hover:bg-slate-800"
          >
            <Settings
              size={20}
              className="text-slate-300"
            />
          </button>

          {/* User Menu */}

          <UserMenu />

        </div>

      </div>

    </header>
  );
}