import {
  Flame,
  Shield,
  Bot,
  Trophy,
} from "lucide-react";

import { useNotificationStore } from "../../store/notificationStore";

type Props = {
  open: boolean;
};

export default function NotificationDropdown({
  open,
}: Props) {
  const notifications = useNotificationStore(
    (state) => state.notifications
  );

  const markAsRead = useNotificationStore(
    (state) => state.markAsRead
  );

  if (!open) return null;

  function getIcon(type: string) {
    switch (type) {
      case "streak":
        return (
          <Flame
            size={18}
            className="text-orange-400"
          />
        );

      case "blocker":
        return (
          <Shield
            size={18}
            className="text-cyan-400"
          />
        );

      case "coach":
        return (
          <Bot
            size={18}
            className="text-teal-400"
          />
        );

      case "achievement":
        return (
          <Trophy
            size={18}
            className="text-yellow-400"
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="absolute right-0 top-14 w-96 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">

      <div className="border-b border-slate-800 p-4">

        <h2 className="text-lg font-semibold text-white">
          Notifications
        </h2>

      </div>

      <div className="max-h-96 overflow-y-auto">

        {notifications.length === 0 && (
          <div className="p-10 text-center text-slate-500">
            You're all caught up 🎉
          </div>
        )}

        {notifications.map((notification) => (
          <button
            key={notification.id}
            onClick={() =>
              markAsRead(notification.id)
            }
            className={`flex w-full gap-4 border-b border-slate-800 p-4 text-left transition hover:bg-slate-800 ${
              notification.read
                ? "opacity-60"
                : ""
            }`}
          >

            <div>
              {getIcon(notification.type)}
            </div>

            <div>

              <h3 className="font-medium text-white">
                {notification.title}
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                {notification.description}
              </p>

              <p className="mt-2 text-xs text-slate-500">
                {new Date(
                  notification.createdAt
                ).toLocaleString()}
              </p>

            </div>

          </button>
        ))}

      </div>

    </div>
  );
}