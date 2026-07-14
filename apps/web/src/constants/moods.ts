import type { Mood } from "../types/journal";

export const moods = [
  {
    mood: "great",
    emoji: "😁",
    label: "Great",
  },
  {
    mood: "good",
    emoji: "😊",
    label: "Good",
  },
  {
    mood: "okay",
    emoji: "😐",
    label: "Okay",
  },
  {
    mood: "bad",
    emoji: "😔",
    label: "Bad",
  },
  {
    mood: "terrible",
    emoji: "😞",
    label: "Terrible",
  },
] satisfies {
  mood: Mood;
  emoji: string;
  label: string;
}[];