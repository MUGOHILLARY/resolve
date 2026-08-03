interface Props {
  insights: string[];
}

export default function AIInsightsCard({
  insights,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        AI Insights
      </h2>

      <div className="space-y-4">

        {insights.map((insight, index) => (
          <div
            key={index}
            className="rounded-xl bg-slate-800 p-4 text-slate-300"
          >
            • {insight}
          </div>
        ))}

      </div>

    </div>
  );
}