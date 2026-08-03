import { useEffect, useRef, useState } from "react";

import { Bell } from "lucide-react";

import NotificationDropdown from "./NotificationDropdown";
import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationButton() {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = useNotificationStore((state) =>
    state.unreadCount()
  );

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        ref.current &&
        !ref.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClick
    );

    return () =>
      document.removeEventListener(
        "mousedown",
        handleClick
      );
  }, []);

  return (
    <div
      ref={ref}
      className="relative"
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative rounded-xl bg-slate-900 p-3 transition-all duration-200 hover:scale-105 hover:bg-slate-800"
        title="Notifications"
      >
        <Bell
          size={20}
          className="text-slate-300"
        />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
      />
    </div>
  );
}