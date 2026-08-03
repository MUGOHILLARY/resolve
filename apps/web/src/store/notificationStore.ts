import { create } from "zustand";

export type Notification = {
  id: string;
  title: string;
  description: string;
  type: "streak" | "blocker" | "coach" | "achievement";
  read: boolean;
  createdAt: string;
};

type NotificationStore = {
  notifications: Notification[];

  addNotification: (
    notification: Omit<
      Notification,
      "id" | "createdAt"
    >
  ) => void;

  markAsRead: (id: string) => void;

  clearNotifications: () => void;

  unreadCount: () => number;
};

export const useNotificationStore =
  create<NotificationStore>((set, get) => ({
    notifications: [],

    addNotification: (notification) =>
      set((state) => {
        const exists = state.notifications.some(
          (n) =>
            n.title === notification.title &&
            n.description === notification.description &&
            !n.read
        );

        if (exists) {
          return state;
        }

        return {
          notifications: [
            {
              ...notification,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        };
      }),

    markAsRead: (id) =>
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        ),
      })),

    clearNotifications: () =>
      set({
        notifications: [],
      }),

    unreadCount: () =>
      get().notifications.filter(
        (notification) => !notification.read
      ).length,
  }));