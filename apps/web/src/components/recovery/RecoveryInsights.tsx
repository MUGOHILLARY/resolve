import { Brain, TrendingUp, Smile, BookOpen } from "lucide-react";

import { useJournalStore } from "../../store/journalStore";

export default function RecoveryInsights() {
  const entries = useJournalStore((state) => state.entries);

  const totalEntries = entries.length;

  const moodCounts = entries.reduce<Record<string, number>>(
    (acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const topMood =
    Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "None";

  const insights = [
    {
      icon: <BookOpen size={22} />,
      title: "Journal Entries",
      value:
        totalEntries === 0
          ? "Start writing today."
          : `You've written ${totalEntries} journal entries.`,
    },
    {
      icon: <Smile size={22} />,
      title: "Most Common Mood",
      value:
        totalEntries === 0
          ? "No mood data yet."
          : topMood,
    },
    {
      icon: <TrendingUp size={22} />,
      title: "Consistency",
      value:
        totalEntries >= 7
          ? "Excellent consistency."
          : "Keep journaling daily.",
    },
    {
      icon: <Brain size={22} />,
      title: "AI Insight",
      value:
        totalEntries >= 10
          ? "You're building a healthy recovery habit."
          : "Small daily progress creates lasting change.",
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">
        Recovery Insights
      </h2>

      <p className="mt-2 text-slate-400">
        Personalized insights based on your recovery journey.
      </p>

      <div className="mt-6 grid gap-4">
        {insights.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4"
          >
            <div className="text-teal-400">
              {item.icon}
            </div>

            <div>
              <h3 className="font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-1 text-slate-400">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}