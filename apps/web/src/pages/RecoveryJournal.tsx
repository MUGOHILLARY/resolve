import { useState } from "react";

import JournalToolbar from "../components/recovery/JournalToolbar";
import MoodSelector from "../components/recovery/MoodSelector";
import JournalEditor from "../components/recovery/JournalEditor";
import JournalList from "../components/recovery/JournalList";

import type { Mood } from "../types/journal";

export default function RecoveryJournal() {
  const [search, setSearch] = useState("");
  const [filterMood, setFilterMood] = useState<Mood | "all">("all");
  const [selectedMood, setSelectedMood] = useState<Mood>("good");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Journal
        </h1>

        <p className="mt-2 text-slate-400">
          Record your thoughts and emotions every day.
        </p>
      </div>

      <JournalToolbar
        search={search}
        onSearchChange={setSearch}
        mood={filterMood}
        onMoodChange={setFilterMood}
      />

      <MoodSelector
        value={selectedMood}
        onChange={setSelectedMood}
      />

      <JournalEditor />

      <JournalList />
    </div>
  );
}