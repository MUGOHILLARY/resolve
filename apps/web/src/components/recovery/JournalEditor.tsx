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

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!title.trim() || !content.trim()) {
      setError("Please enter a title and journal entry.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await addEntry(mood, title, content);

      setMood("good");
      setTitle("");
      setContent("");

    } catch (err) {
      console.error(err);

      setError("Failed to save journal entry.");
    } finally {
      setSaving(false);
    }
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
        placeholder="How did today go?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="mt-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none transition focus:border-teal-500"
      />

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-6 rounded-xl bg-teal-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Entry"}
      </button>
    </JournalCard>
  );
}