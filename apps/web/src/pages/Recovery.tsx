import JournalEditor from "../components/recovery/JournalEditor";
import JournalList from "../components/recovery/JournalList";
import RecoveryAchievements from "../components/recovery/RecoveryAchievements";
import RecoveryCalendar from "../components/recovery/RecoveryCalendar";
import RecoveryStats from "../components/recovery/RecoveryStats";

export default function Recovery() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Journal
        </h1>

        <p className="mt-2 text-slate-400">
          Track your recovery journey, reflect on your progress, and
          build healthy habits one day at a time.
        </p>
      </div>

      <RecoveryStats />

      <JournalEditor />

      <RecoveryCalendar />

      <RecoveryAchievements />

      <JournalList />
    </div>
  );
}