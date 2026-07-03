const activities = [
  "Completed a 30-minute focus session",
  "Resisted an urge",
  "Journal entry created",
  "Blocked distracting website",
];

export default function RecentActivity() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-5 text-xl font-semibold text-white">
        Recent Activity
      </h2>

      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity}
            className="rounded-xl bg-slate-800 p-4 text-slate-300"
          >
            {activity}
          </div>
        ))}
      </div>
    </div>
  );
}