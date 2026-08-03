interface Props {
  dailyHabits: string;
  preferences: string;
  reminderTime: string;

  setDailyHabits: (value: string) => void;
  setPreferences: (value: string) => void;
  setReminderTime: (value: string) => void;
}

export default function DailyHabitsCard({
  dailyHabits,
  preferences,
  reminderTime,
  setDailyHabits,
  setPreferences,
  setReminderTime,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        🌱 Daily Recovery
      </h2>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Daily Habits
          </label>

          <textarea
            rows={4}
            value={dailyHabits}
            onChange={(e) =>
              setDailyHabits(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Preferred Coaching Style
          </label>

          <textarea
            rows={3}
            value={preferences}
            onChange={(e) =>
              setPreferences(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm text-slate-300">
            Daily Reminder Time
          </label>

          <input
            type="time"
            value={reminderTime}
            onChange={(e) =>
              setReminderTime(e.target.value)
            }
            className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>
      </div>
    </div>
  );
}