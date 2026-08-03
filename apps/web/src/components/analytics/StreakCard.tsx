interface Props {
  streak: number;
}

export default function StreakCard({
  streak,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        Current Recovery Streak
      </p>

      <h2 className="mt-4 text-4xl font-bold text-teal-400">
        {streak} Days
      </h2>

    </div>
  );
}