import { CalendarDays } from "lucide-react";

export default function RecoveryTimeline() {
  const events = [
    {
      date: "Today",
      title: "Recovery Journey Started",
      description: "Begin tracking your recovery progress.",
    },
    {
      date: "Next Milestone",
      title: "First Week",
      description: "Complete 7 days of consistent recovery habits.",
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-900 p-6 shadow-lg">
      <div className="mb-6 flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-teal-400" />
        <h2 className="text-xl font-semibold text-white">
          Recovery Timeline
        </h2>
      </div>

      <div className="space-y-6">
        {events.map((event, index) => (
          <div
            key={index}
            className="relative border-l-2 border-teal-500 pl-6"
          >
            <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-teal-500"></div>

            <p className="text-sm text-slate-400">
              {event.date}
            </p>

            <h3 className="mt-1 text-lg font-semibold text-white">
              {event.title}
            </h3>

            <p className="mt-1 text-slate-300">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}