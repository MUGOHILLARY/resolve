import { useDashboardStore } from "../../store/dashboardStore";

export default function RecoveryScore() {
  const score = useDashboardStore(
    (state) => state.recoveryScore
  );

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="text-xl font-semibold text-white">
        Recovery Score
      </h2>

      <div className="mt-6 flex items-center justify-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-teal-500">
          <span className="text-5xl font-bold text-teal-400">
            {score}
          </span>
        </div>
      </div>

      <p className="mt-6 text-center text-slate-400">
        Excellent progress. Keep building healthy habits.
      </p>
    </div>
  );
}