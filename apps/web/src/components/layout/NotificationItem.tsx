import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Trophy,
} from "lucide-react";

import Badge from "../ui/Badge";

import {
  Notification,
} from "../../store/notificationStore";

type Props = {
  notification: Notification;
  onClick: () => void;
};

export default function NotificationItem({
  notification,
  onClick,
}: Props) {
  function getIcon() {
    switch (notification.type) {
      case "achievement":
        return (
          <Trophy
            size={18}
            className="text-yellow-400"
          />
        );

      case "blocker":
        return (
          <AlertTriangle
            size={18}
            className="text-red-400"
          />
        );

      case "coach":
        return (
          <Info
            size={18}
            className="text-cyan-400"
          />
        );

      case "streak":
        return (
          <CheckCircle2
            size={18}
            className="text-green-400"
          />
        );

      default:
        return (
          <Info
            size={18}
            className="text-slate-400"
          />
        );
    }
  }

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-slate-800 bg-slate-900 p-4 text-left transition hover:border-teal-500 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          {getIcon()}

          <div>
            <h4 className="font-semibold text-white">
              {notification.title}
            </h4>

            <p className="mt-1 text-sm text-slate-400">
              {notification.description}
            </p>
          </div>
        </div>

        {!notification.read && (
          <Badge variant="info">
            New
          </Badge>
        )}
      </div>
    </button>
  );
}