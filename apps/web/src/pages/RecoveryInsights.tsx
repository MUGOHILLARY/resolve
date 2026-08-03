import RecoveryInsights from "../components/recovery/RecoveryInsights";

export default function RecoveryInsightsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Insights
        </h1>

        <p className="mt-2 text-slate-400">
          Discover patterns in your recovery.
        </p>
      </div>

      <RecoveryInsights />
    </div>
  );
}