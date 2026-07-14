import { useJournalStore } from "../../store/journalStore";

export default function RecoveryCalendar() {
  const entries = useJournalStore((state) => state.entries);

  const days = Array.from({ length: 35 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (34 - index));

    const dateString = date.toLocaleDateString();

    const completed = entries.some(
      (entry) => entry.date === dateString
    );

    return {
      date: dateString,
      completed,
    };
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          Recovery Calendar
        </h2>

        <p className="mt-2 text-slate-400">
          Every journal entry counts as a successful recovery day.
        </p>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day) => (
          <div
            key={day.date}
            title={day.date}
            className={`
              aspect-square rounded-lg border transition
              ${
                day.completed
                  ? "border-emerald-500 bg-emerald-500"
                  : "border-slate-700 bg-slate-800"
              }
            `}
          />
        ))}
      </div>

      <div className="mt-6 flex items-center gap-6 text-sm text-slate-400">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-slate-800" />
          No Entry
        </div>

        <div className="flex items-center gap-2">
          <div className="h-4 w-4 rounded bg-emerald-500" />
          Recovery Day
        </div>
      </div>
    </div>
  );
}