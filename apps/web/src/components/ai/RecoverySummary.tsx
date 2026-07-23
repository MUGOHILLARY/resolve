import { BookOpen, Heart, TrendingUp } from "lucide-react";

import { useJournalStore } from "../../store/journalStore";

export default function RecoverySummary() {
  const entries = useJournalStore((state) => state.entries);

  const totalEntries = entries.length;
  const latestMood = totalEntries > 0 ? entries[0].mood : "None";

  const encouragement =
    totalEntries === 0
      ? "Start your first journal entry today."
      : totalEntries < 5
      ? "You're building a healthy habit."
      : totalEntries < 15
      ? "Great consistency! Keep going."
      : "Excellent commitment to your recovery journey.";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <BookOpen className="text-teal-400" size={24} />

          <div>
            <p className="text-sm text-slate-400">
              Journal Entries
            </p>

            <h3 className="text-3xl font-bold text-white">
              {totalEntries}
            </h3>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <Heart className="text-pink-400" size={24} />

          <div>
            <p className="text-sm text-slate-400">
              Latest Mood
            </p>

            <h3 className="text-2xl font-bold capitalize text-white">
              {latestMood}
            </h3>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-green-400" size={24} />

          <div>
            <p className="text-sm text-slate-400">
              AI Insight
            </p>

            <p className="mt-1 text-white">
              {encouragement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}