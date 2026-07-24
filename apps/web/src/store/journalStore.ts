import { create } from "zustand";

import {
  loadJournals,
  removeJournal,
  saveJournal,
} from "../services/journalService";

import type {
  JournalEntry,
  Mood,
} from "../types/journal";

type JournalStore = {
  entries: JournalEntry[];
  loading: boolean;

  loadEntries: () => Promise<void>;

  addEntry: (
    mood: Mood,
    title: string,
    content: string
  ) => Promise<void>;

  deleteEntry: (id: string) => Promise<void>;
};

export const useJournalStore = create<JournalStore>((set) => ({
  entries: [],
  loading: false,

  /*
  |--------------------------------------------------------------------------
  | Load Journals
  |--------------------------------------------------------------------------
  */

  loadEntries: async () => {
    set({ loading: true });

    try {
      const journals = await loadJournals();

      set({
        entries: journals.map((journal) => ({
          id: journal.id,
          mood: journal.mood as Mood,
          title: journal.title,
          content: journal.content,
          date: new Date(
            journal.created_at
          ).toLocaleDateString(),
          createdAt: new Date(
            journal.created_at
          ).getTime(),
        })),
        loading: false,
      });
    } catch (error) {
      console.error("Failed to load journals:", error);

      set({
        loading: false,
      });
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Save Journal
  |--------------------------------------------------------------------------
  */

  addEntry: async (mood, title, content) => {
    try {
      const journal = await saveJournal(
        mood,
        title,
        content
      );

      set((state) => ({
        entries: [
          {
            id: journal.id,
            mood: journal.mood as Mood,
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
      console.error("Failed to save journal:", error);
      throw error;
    }
  },

  /*
  |--------------------------------------------------------------------------
  | Delete Journal
  |--------------------------------------------------------------------------
  */

  deleteEntry: async (id: string) => {
    try {
      await removeJournal(id);

      set((state) => ({
        entries: state.entries.filter(
          (entry) => entry.id !== id
        ),
      }));
    } catch (error) {
      console.error("Failed to delete journal:", error);
      throw error;
    }
  },
}));