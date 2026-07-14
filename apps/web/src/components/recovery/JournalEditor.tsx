import { useState } from "react";

import JournalCard from "./JournalCard";
import MoodSelector from "./MoodSelector";

import type { Mood } from "../../types/journal";
import { useJournalStore } from "../../store/journalStore";

export default function JournalEditor() {
  const addEntry = useJournalStore((state) => state.addEntry);

  const [mood, setMood] = useState<Mood>("good");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSave() {
    if (!title.trim() || !content.trim()) {
      return;
    }

    addEntry(mood, title, content);

    setMood("good");
    setTitle("");
    setContent("");
  }

  return (
    <JournalCard
      title="Today's Reflection"
      subtitle="Write about today's recovery journey."
    >
      <MoodSelector
        value={mood}
        onChange={setMood}
      />

      <input
        type="text"
        placeholder="Entry title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="mt-6 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-500"
      />

      <textarea
        rows={7}
        placeholder="How did today go today?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-500"
      />

      <button
        type="button"
        onClick={handleSave}
        className="mt-6 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
      >
        Save Entry
      </button>
    </JournalCard>
  );
}