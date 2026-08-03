import RecoveryAchievements from "../components/recovery/RecoveryAchievements";

export default function RecoveryAchievementsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Achievements
        </h1>

        <p className="mt-2 text-slate-400">
          Celebrate every milestone.
        </p>
      </div>

      <RecoveryAchievements />
    </div>
  );
}