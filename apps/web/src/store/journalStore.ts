import { create } from "zustand";

import type { JournalEntry, Mood } from "../types/journal";

type JournalStore = {
  entries: JournalEntry[];

  addEntry: (
    mood: Mood,
    title: string,
    content: string
  ) => void;

  deleteEntry: (id: string) => void;
};

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],

  addEntry: (mood, title, content) =>
    set((state) => ({
      entries: [
        {
          id: crypto.randomUUID(),
          date: new Date().toLocaleDateString(),
          mood,
          title,
          content,
          createdAt: Date.now(),
        },
        ...state.entries,
      ],
    })),

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((entry) => entry.id !== id),
    })),
}));