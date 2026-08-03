import { create } from "zustand";

import type { BlockerSettings } from "../services/blockerService";

interface BlockerState {
  settings: BlockerSettings | null;

  loading: boolean;

  setSettings: (
    settings: BlockerSettings
  ) => void;

  updateSettings: (
    updates: Partial<BlockerSettings>
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  clear: () => void;
}

export const useBlockerStore =
  create<BlockerState>((set) => ({

    settings: null,

    loading: false,

    setSettings: (settings) =>
      set({
        settings,
      }),

    updateSettings: (updates) =>
      set((state) => ({
        settings: state.settings
          ? {
              ...state.settings,
              ...updates,
            }
          : null,
      })),

    setLoading: (loading) =>
      set({
        loading,
      }),

    clear: () =>
      set({
        settings: null,
        loading: false,
      }),

  }));