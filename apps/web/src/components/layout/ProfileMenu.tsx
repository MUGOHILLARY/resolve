import { useMemo, useState } from "react";

import {
  User,
  BarChart3,
  Keyboard,
  Settings,
  CircleHelp,
  LogOut,
  ChevronDown,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Dropdown from "../ui/Dropdown";
import DropdownItem from "../ui/DropdownItem";

import KeyboardShortcutsModal from "./KeyboardShortcutsModal";

import { useAuthStore } from "../../store/authStore";

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] =
    useState(false);

  const navigate = useNavigate();

  const user = useAuthStore(
    (state) => state.user
  );

  const logout = useAuthStore(
    (state) => state.logout
  );

  const initials = useMemo(() => {
    if (user?.email) {
      return user.email
        .substring(0, 2)
        .toUpperCase();
    }

    return "HK";
  }, [user]);


  function go(path: string) {
    navigate(path);
    setOpen(false);
  }


  async function handleLogout() {
    try {
      await logout();

      setOpen(false);

      navigate("/login");

    } catch (error) {
      console.error(
        "Logout failed:",
        error
      );
    }
  }


  return (
    <div className="relative">

      <button
        onClick={() =>
          setOpen((value) => !value)
        }
        className="flex items-center gap-2 rounded-xl border border-slate-700 px-2 py-2 transition hover:border-teal-500"
      >

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 to-cyan-400 font-bold text-slate-950">
          {initials}
        </div>


        <ChevronDown
          size={16}
          className={`transition ${
            open ? "rotate-180" : ""
          }`}
        />

      </button>



      <Dropdown
        open={open}
        onClose={() => setOpen(false)}
      >

        <div className="border-b border-slate-800 p-5">

          <p className="font-semibold text-white">
            {user?.email ?? "Guest"}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Recovery Account
          </p>

        </div>



        <DropdownItem
          icon={<User size={18} />}
          onClick={() =>
            go("/recovery/profile")
          }
        >
          My Profile
        </DropdownItem>



        <DropdownItem
          icon={<BarChart3 size={18} />}
          onClick={() =>
            go("/analytics")
          }
        >
          Recovery Statistics
        </DropdownItem>



        <DropdownItem
          icon={<Keyboard size={18} />}
          onClick={() => {
            setOpen(false);
            setShortcutsOpen(true);
          }}
        >
          Keyboard Shortcuts
        </DropdownItem>



        <DropdownItem
          icon={<Settings size={18} />}
          onClick={() =>
            go("/settings")
          }
        >
          Settings
        </DropdownItem>



        <DropdownItem
          icon={<CircleHelp size={18} />}
        >
          Help & Support
        </DropdownItem>



        <div className="mt-2 border-t border-slate-800 pt-2">

          <DropdownItem
            icon={<LogOut size={18} />}
            onClick={handleLogout}
          >
            Logout
          </DropdownItem>

        </div>


      </Dropdown>



      <KeyboardShortcutsModal
        open={shortcutsOpen}
        onClose={() =>
          setShortcutsOpen(false)
        }
      />

    </div>
  );
}