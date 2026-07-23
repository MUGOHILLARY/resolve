import { Flame } from "lucide-react";

import { useJournalStore } from "../../store/journalStore";

export default function RecoveryStreak() {
  const entries = useJournalStore((state) => state.entries);

  const streak = calculateStreak(entries);

  return (
    <div className="rounded-2xl border border-orange-500/20 bg-slate-900 p-6">
      <div className="flex items-center gap-3">
        <Flame
          className="text-orange-400"
          size={30}
        />

        <div>
          <p className="text-sm text-slate-400">
            Current Streak
          </p>

          <h2 className="text-3xl font-bold text-white">
            {streak} Day{streak === 1 ? "" : "s"}
          </h2>
        </div>
      </div>
    </div>
  );
}

function calculateStreak(
  entries: { createdAt: number }[]
) {
  if (entries.length === 0) return 0;

  const uniqueDays = new Set(
    entries.map((entry) =>
      new Date(entry.createdAt).toDateString()
    )
  );

  return uniqueDays.size;
}