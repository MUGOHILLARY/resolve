import { useMemo } from "react";

import { moods } from "../../constants/moods";
import { useJournalStore } from "../../store/journalStore";

export default function MoodAnalytics() {
  const entries = useJournalStore((state) => state.entries);

  const counts = useMemo(() => {
    const result: Record<string, number> = {};

    moods.forEach((mood) => {
      result[mood.mood] = 0;
    });

    entries.forEach((entry) => {
      result[entry.mood]++;
    });

    return result;
  }, [entries]);

  const maxCount = Math.max(...Object.values(counts), 1);

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        Mood Analytics
      </h2>

      <div className="space-y-5">
        {moods.map((mood) => {
          const value = counts[mood.mood];
          const percentage = (value / maxCount) * 100;

          return (
            <div key={mood.mood}>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {mood.emoji}
                  </span>

                  <span className="text-slate-300">
                    {mood.label}
                  </span>
                </div>

                <span className="font-semibold text-white">
                  {value}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-teal-500 transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}