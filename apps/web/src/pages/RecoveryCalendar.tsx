import RecoveryCalendar from "../components/recovery/RecoveryCalendar";

export default function RecoveryCalendarPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Calendar
        </h1>

        <p className="mt-2 text-slate-400">
          View your recovery activity by date.
        </p>
      </div>

      <RecoveryCalendar />
    </div>
  );
}