import { Flame, BookOpen, Heart, Trophy } from "lucide-react";
import { useMemo } from "react";

import { useJournalStore } from "../../store/journalStore";

const moodScores = {
  terrible: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
} as const;

export default function RecoveryKPIs() {
  const entries = useJournalStore((state) => state.entries);

  const totalEntries = entries.length;

  const averageMood = useMemo(() => {
    if (entries.length === 0) return 0;

    const total = entries.reduce(
      (sum, entry) => sum + moodScores[entry.mood],
      0
    );

    return total / entries.length;
  }, [entries]);

  const averageMoodLabel =
    averageMood >= 4.5
      ? "Great"
      : averageMood >= 3.5
      ? "Good"
      : averageMood >= 2.5
      ? "Okay"
      : averageMood >= 1.5
      ? "Bad"
      : "Terrible";

  const recoveryScore = Math.min(
    100,
    Math.round(
      totalEntries * 4 +
      averageMood * 12
    )
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={<Flame size={24} />}
        title="Current Streak"
        value={`${new Set(
          entries.map((e) =>
            new Date(e.createdAt).toDateString()
          )
        ).size} Days`}
      />

      <KpiCard
        icon={<BookOpen size={24} />}
        title="Journal Entries"
        value={String(totalEntries)}
      />

      <KpiCard
        icon={<Heart size={24} />}
        title="Average Mood"
        value={averageMoodLabel}
      />

      <KpiCard
        icon={<Trophy size={24} />}
        title="Recovery Score"
        value={`${recoveryScore}%`}
      />
    </div>
  );
}

type CardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
};

function KpiCard({
  icon,
  title,
  value,
}: CardProps) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 text-teal-400">
        {icon}
      </div>

      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h2 className="mt-2 text-3xl font-bold text-white">
        {value}
      </h2>
    </div>
  );
}