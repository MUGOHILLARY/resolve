import { Flame } from "lucide-react";

import { useStreakStore } from "../../store/streakStore";
import { getRecoveryLevel } from "../../utils/recoveryLevel";

export default function RecoveryStatusCard() {
  const streak = useStreakStore((state) => state.streak);

  const level = getRecoveryLevel(streak);

  return (
    <div className="mx-4 rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="mb-4 flex items-center gap-3">
        <Flame className="text-orange-500" size={24} />

        <div>
          <p className="font-semibold text-white">
            {streak} Day{streak !== 1 ? "s" : ""} Streak
          </p>

          <p className="text-sm text-slate-400">
            {level.title}
          </p>
        </div>
      </div>

      <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-700 ${level.color}`}
          style={{
            width: `${Math.min(level.progress, 100)}%`,
          }}
        />
      </div>

      <p className="text-sm leading-6 text-slate-400">
        {level.message}
      </p>
    </div>
  );
}