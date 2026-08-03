interface Props {
  score: number;
}

export default function RecoveryScoreCard({
  score,
}: Props) {
  const color =
    score >= 80
      ? "text-emerald-400"
      : score >= 60
      ? "text-yellow-400"
      : "text-red-400";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <p className="text-sm text-slate-400">
        Recovery Score
      </p>

      <h2
        className={`mt-4 text-5xl font-bold ${color}`}
      >
        {score}%
      </h2>

      <p className="mt-4 text-slate-400">
        Based on journaling, consistency,
        recovery profile and AI engagement.
      </p>

    </div>
  );
}