import Button from "../ui/Button";
import NotificationItem from "./NotificationItem";

import {
  useNotificationStore,
} from "../../store/notificationStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function NotificationPanel({
  open,
  onClose,
}: Props) {
  const {
    notifications,
    markAsRead,
    clearNotifications,
  } = useNotificationStore();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      <div className="absolute right-0 top-16 z-50 w-[420px] rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Notifications
          </h3>

          <Button
            size="sm"
            variant="ghost"
            onClick={onClose}
          >
            ✕
          </Button>
        </div>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="py-10 text-center text-slate-500">
              You're all caught up.
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={() => markAsRead(notification.id)}
              />
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <div className="mt-6 flex justify-end">
            <Button
              variant="danger"
              onClick={clearNotifications}
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </>
  );
}