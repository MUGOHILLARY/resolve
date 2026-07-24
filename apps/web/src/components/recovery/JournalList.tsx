import { useEffect, useMemo, useState } from "react";

import JournalEntry from "./JournalEntry";
import JournalToolbar from "./JournalToolbar";

import { useJournalStore } from "../../store/journalStore";
import type { Mood } from "../../types/journal";

export default function JournalList() {
  const entries = useJournalStore((state) => state.entries);
  const loading = useJournalStore((state) => state.loading);
  const loadEntries = useJournalStore((state) => state.loadEntries);

  const [search, setSearch] = useState("");
  const [mood, setMood] = useState<Mood | "all">("all");

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSearch =
        entry.title.toLowerCase().includes(search.toLowerCase()) ||
        entry.content.toLowerCase().includes(search.toLowerCase());

      const matchesMood =
        mood === "all" || entry.mood === mood;

      return matchesSearch && matchesMood;
    });
  }, [entries, search, mood]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
        Loading journal entries...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <JournalToolbar
        search={search}
        onSearchChange={setSearch}
        mood={mood}
        onMoodChange={setMood}
      />

      {filteredEntries.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-700 p-10 text-center">
          <h3 className="text-xl font-semibold text-white">
            No journal entries yet
          </h3>

          <p className="mt-3 text-slate-400">
            Write your first recovery reflection to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredEntries.map((entry) => (
            <JournalEntry
              key={entry.id}
              entry={entry}
            />
          ))}
        </div>
      )}
    </div>
  );
}