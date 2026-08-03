import { useMemo, useState } from "react";
import { Bell } from "lucide-react";

import NotificationPanel from "./NotificationPanel";

import { useNotificationStore } from "../../store/notificationStore";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);

  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (notification) => !notification.read
      ).length,
    [notifications]
  );

  return (
    <div className="relative">

      <button
        onClick={() => setOpen((value) => !value)}
        className="relative rounded-2xl border border-slate-700 p-3 transition hover:border-teal-500 hover:text-teal-400"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      <NotificationPanel
        open={open}
        onClose={() => setOpen(false)}
      />

    </div>
  );
}