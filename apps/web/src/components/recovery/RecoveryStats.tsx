import { BookOpen, Flame, Smile, Trophy } from "lucide-react";

import { useJournalStore } from "../../store/journalStore";

export default function RecoveryStats() {
  const entries = useJournalStore((state) => state.entries);

  const totalEntries = entries.length;

  const moodCounts = entries.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const mostCommonMood =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "None";

  const stats = [
    {
      title: "Current Streak",
      value: "1 Day",
      icon: <Flame size={22} />,
      color: "text-orange-400",
    },
    {
      title: "Journal Entries",
      value: totalEntries.toString(),
      icon: <BookOpen size={22} />,
      color: "text-cyan-400",
    },
    {
      title: "Top Mood",
      value: mostCommonMood,
      icon: <Smile size={22} />,
      color: "text-yellow-400",
    },
    {
      title: "Best Streak",
      value: "Coming Soon",
      icon: <Trophy size={22} />,
      color: "text-emerald-400",
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.title}
          className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-teal-500/40"
        >
          <div className={`mb-4 ${stat.color}`}>
            {stat.icon}
          </div>

          <h3 className="text-sm text-slate-400">
            {stat.title}
          </h3>

          <p className="mt-2 text-2xl font-bold text-white">
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}