import { useEffect, useRef, useState } from "react";

import {
  User,
  Shield,
  Settings,
  HelpCircle,
  LogOut,
  Palette,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuthStore } from "../../store/authStore";

export default function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const navigate = useNavigate();

  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  const initials =
    user?.email?.charAt(0).toUpperCase() ?? "U";

  const name =
    user?.user_metadata?.full_name ??
    user?.email?.split("@")[0] ??
    "User";

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 rounded-xl bg-slate-900 px-4 py-2 transition hover:bg-slate-800"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 font-bold text-white">
          {initials}
        </div>

        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-white">
            {name}
          </p>

          <p className="text-xs text-slate-400">
            Recovery Member
          </p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

          <div className="border-b border-slate-800 p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 text-lg font-bold text-white">
                {initials}
              </div>

              <div>
                <h3 className="font-semibold text-white">
                  {name}
                </h3>

                <p className="text-sm text-slate-400">
                  {user?.email}
                </p>
              </div>

            </div>

          </div>

          <MenuItem
            icon={<User size={18} />}
            text="My Profile"
            onClick={() => navigate("/recovery/profile")}
          />

          <MenuItem
            icon={<Shield size={18} />}
            text="Recovery Profile"
            onClick={() => navigate("/recovery")}
          />

          <MenuItem
            icon={<Settings size={18} />}
            text="Settings"
            onClick={() => navigate("/settings")}
          />

          <MenuItem
            icon={<Palette size={18} />}
            text="Appearance"
          />

          <MenuItem
            icon={<HelpCircle size={18} />}
            text="Help"
          />

          <div className="border-t border-slate-800">

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-5 py-4 text-red-400 transition hover:bg-red-600 hover:text-white"
            >
              <LogOut size={18} />

              Logout
            </button>

          </div>

        </div>
      )}
    </div>
  );
}

type MenuItemProps = {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
};

function MenuItem({
  icon,
  text,
  onClick,
}: MenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-4 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      {icon}

      {text}
    </button>
  );
}