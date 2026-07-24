import {
  createJournal,
  deleteJournal,
  getJournals,
} from "../lib/api";

import type { Mood } from "../types/journal";

export async function loadJournals() {
  return await getJournals();
}

export async function saveJournal(
  mood: Mood,
  title: string,
  content: string
) {
  return await createJournal({
    mood,
    title,
    content,
  });
}

export async function removeJournal(id: string) {
  return await deleteJournal(id);
}