import {
  Award,
  BookOpen,
  Flame,
  Star,
} from "lucide-react";

import { useJournalStore } from "../../store/journalStore";

export default function RecoveryAchievements() {
  const entries = useJournalStore((state) => state.entries);

  const achievements = [
    {
      title: "First Journal Entry",
      icon: <BookOpen size={22} />,
      unlocked: entries.length >= 1,
    },
    {
      title: "7-Day Streak",
      icon: <Flame size={22} />,
      unlocked: false,
    },
    {
      title: "30-Day Recovery",
      icon: <Award size={22} />,
      unlocked: false,
    },
    {
      title: "100-Day Champion",
      icon: <Star size={22} />,
      unlocked: false,
    },
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">
        Achievements
      </h2>

      <p className="mt-2 text-slate-400">
        Celebrate every milestone in your recovery journey.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {achievements.map((achievement) => (
          <div
            key={achievement.title}
            className={`flex items-center gap-4 rounded-2xl border p-4 transition ${
              achievement.unlocked
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700 bg-slate-800"
            }`}
          >
            <div
              className={
                achievement.unlocked
                  ? "text-emerald-400"
                  : "text-slate-500"
              }
            >
              {achievement.icon}
            </div>

            <div className="flex-1">
              <h3 className="font-semibold text-white">
                {achievement.title}
              </h3>

              <p className="text-sm text-slate-400">
                {achievement.unlocked
                  ? "Unlocked"
                  : "Locked"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}