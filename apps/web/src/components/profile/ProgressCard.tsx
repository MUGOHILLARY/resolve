interface Props {
  currentStreak: number;
  setCurrentStreak: (value: number) => void;
}

export default function ProgressCard({
  currentStreak,
  setCurrentStreak,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        📈 Progress
      </h2>

      <div>
        <label className="mb-2 block text-sm text-slate-300">
          Current Recovery Streak (Days)
        </label>

        <input
          type="number"
          min={0}
          value={currentStreak}
          onChange={(e) =>
            setCurrentStreak(Number(e.target.value))
          }
          className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
        />
      </div>
    </div>
  );
}