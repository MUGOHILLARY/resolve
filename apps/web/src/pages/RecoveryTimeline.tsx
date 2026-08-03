import RecoveryTimeline from "../components/recovery/RecoveryTimeline";

export default function RecoveryTimelinePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Timeline
        </h1>

        <p className="mt-2 text-slate-400">
          Review your recovery journey over time.
        </p>
      </div>

      <RecoveryTimeline />
    </div>
  );
}