import { create } from "zustand";

import { createJournal, getJournals } from "../lib/api";

import type { JournalEntry, Mood } from "../types/journal";

type JournalStore = {
  entries: JournalEntry[];
  loading: boolean;

  loadEntries: () => Promise<void>;

  addEntry: (
    mood: Mood,
    title: string,
    content: string
  ) => Promise<void>;

  deleteEntry: (id: string) => void;
};

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  loading: false,

  loadEntries: async () => {
    set({ loading: true });

    try {
      const journals = await getJournals();

      const entries: JournalEntry[] = journals.map((journal: any) => ({
        id: journal.id,
        mood: journal.mood,
        title: journal.title,
        content: journal.content,
        date: new Date(journal.created_at).toLocaleDateString(),
        createdAt: new Date(journal.created_at).getTime(),
      }));

      set({
        entries,
        loading: false,
      });

    } catch (error) {
      console.error(error);

      set({
        loading: false,
      });
    }
  },

  addEntry: async (mood, title, content) => {

    try {

      const journal = await createJournal({
        mood,
        title,
        content,
      });

      set((state) => ({
        entries: [
          {
            id: journal.id,
            mood: journal.mood,
            title: journal.title,
            content: journal.content,
            date: new Date(
              journal.created_at
            ).toLocaleDateString(),
            createdAt: new Date(
              journal.created_at
            ).getTime(),
          },
          ...state.entries,
        ],
      }));

    } catch (error) {

      console.error(error);

    }

  },

  deleteEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter(
        (entry) => entry.id !== id
      ),
    })),
}));