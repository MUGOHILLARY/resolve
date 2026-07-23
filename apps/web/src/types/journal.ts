export type Mood =
  | "great"
  | "good"
  | "okay"
  | "bad"
  | "terrible";

export interface JournalEntry {
  id: string;
  mood: Mood;
  title: string;
  content: string;
  date: string;
  createdAt: number;
}