import { create } from "zustand";

import type {
  Session,
  User,
} from "@supabase/supabase-js";

import {
  signIn,
  signOut,
  signUp,
} from "../services/authService";

type AuthStore = {
  user: User | null;
  session: Session | null;
  loading: boolean;

  setSession: (
    session: Session | null,
    user: User | null
  ) => void;

  setLoading: (loading: boolean) => void;

  register: (
    email: string,
    password: string
  ) => Promise<void>;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  loading: true,

  setSession: (session, user) =>
    set({
      session,
      user,
    }),

  setLoading: (loading) =>
    set({
      loading,
    }),

  register: async (email, password) => {
    await signUp(email, password);
  },

  login: async (email, password) => {
    await signIn(email, password);
  },

  logout: async () => {
    await signOut();
  },
}));