import { useMemo, useState } from "react";

import JournalEntry from "./JournalEntry";
import JournalToolbar from "./JournalToolbar";

import { useJournalStore } from "../../store/journalStore";
import type { Mood } from "../../types/journal";

export default function JournalList() {
  const entries = useJournalStore((state) => state.entries);

  const [search, setSearch] = useState("");
  const [mood, setMood] = useState<Mood | "all">("all");

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
            No matching journal entries
          </h3>

          <p className="mt-3 text-slate-400">
            Try changing your search or mood filter.
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