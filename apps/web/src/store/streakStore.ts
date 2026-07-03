import { create } from "zustand";

type StreakState = {
  streak: number;
  setStreak: (days: number) => void;
  incrementStreak: () => void;
};

export const useStreakStore = create<StreakState>((set) => ({
  streak: 7,

  setStreak: (days) =>
    set({
      streak: days,
    }),

  incrementStreak: () =>
    set((state) => ({
      streak: state.streak + 1,
    })),
}));