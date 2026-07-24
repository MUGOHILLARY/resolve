import { create } from "zustand";

import type { RecoveryProfile } from "../services/profileService";

interface ProfileState {
  profile: RecoveryProfile | null;
  loading: boolean;

  setProfile: (
    profile: RecoveryProfile | null
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  clearProfile: () => void;
}

export const useProfileStore =
  create<ProfileState>((set) => ({

    profile: null,

    loading: false,

    setProfile: (profile) =>
      set({
        profile,
      }),

    setLoading: (loading) =>
      set({
        loading,
      }),

    clearProfile: () =>
      set({
        profile: null,
        loading: false,
      }),

  }));