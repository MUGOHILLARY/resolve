import { create } from "zustand";

type DashboardState = {
  focusTime: string;
  urgesResisted: number;
  blockedSites: number;
  recoveryScore: number;

  setFocusTime: (value: string) => void;
  setUrgesResisted: (value: number) => void;
  setBlockedSites: (value: number) => void;
  setRecoveryScore: (value: number) => void;

  incrementBlockedSites: () => void;
  incrementUrgesResisted: () => void;

  addFocusMinutes: (minutes: number) => void;

  resetToday: () => void;
};

export const useDashboardStore = create<DashboardState>((set, get) => ({
  focusTime: "4h 12m",
  urgesResisted: 12,
  blockedSites: 145,
  recoveryScore: 91,

  setFocusTime: (focusTime) => set({ focusTime }),

  setUrgesResisted: (urgesResisted) =>
    set({ urgesResisted }),

  setBlockedSites: (blockedSites) =>
    set({ blockedSites }),

  setRecoveryScore: (recoveryScore) =>
    set({ recoveryScore }),

  incrementBlockedSites: () =>
    set((state) => ({
      blockedSites: state.blockedSites + 1,
    })),

  incrementUrgesResisted: () =>
    set((state) => ({
      urgesResisted: state.urgesResisted + 1,
    })),

  addFocusMinutes: (minutes) => {
    const current = get().focusTime;

    const match = current.match(/(\d+)h\s+(\d+)m/);

    if (!match) return;

    let hours = parseInt(match[1], 10);
    let mins = parseInt(match[2], 10);

    mins += minutes;

    hours += Math.floor(mins / 60);
    mins %= 60;

    set({
      focusTime: `${hours}h ${mins}m`,
    });
  },

  resetToday: () =>
    set({
      focusTime: "0h 0m",
      urgesResisted: 0,
      blockedSites: 0,
    }),
}));