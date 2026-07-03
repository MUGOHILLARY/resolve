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
};

export const useDashboardStore = create<DashboardState>((set) => ({
  focusTime: "4h 12m",
  urgesResisted: 12,
  blockedSites: 145,
  recoveryScore: 91,

  setFocusTime: (focusTime) => set({ focusTime }),
  setUrgesResisted: (urgesResisted) => set({ urgesResisted }),
  setBlockedSites: (blockedSites) => set({ blockedSites }),
  setRecoveryScore: (recoveryScore) => set({ recoveryScore }),
}));