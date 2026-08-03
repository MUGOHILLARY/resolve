import RecoveryStats from "../components/recovery/RecoveryStats";
import RecoveryInsights from "../components/recovery/RecoveryInsights";
import RecoveryAchievements from "../components/recovery/RecoveryAchievements";

export default function RecoveryOverview() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Overview
        </h1>

        <p className="mt-2 text-slate-400">
          Your overall recovery progress at a glance.
        </p>
      </div>

      <RecoveryStats />

      <RecoveryInsights />

      <RecoveryAchievements />
    </div>
  );
}