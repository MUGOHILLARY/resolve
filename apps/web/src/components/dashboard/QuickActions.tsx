import {
  BookOpen,
  Timer,
  Bot,
  Target,
} from "lucide-react";

const actions = [
  {
    title: "Journal",
    icon: BookOpen,
  },
  {
    title: "Focus",
    icon: Timer,
  },
  {
    title: "AI Coach",
    icon: Bot,
  },
  {
    title: "Goals",
    icon: Target,
  },
];

export default function QuickActions() {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-5 text-xl font-semibold text-white">
        Quick Actions
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.title}
              className="rounded-2xl border border-slate-700 p-5 transition hover:border-teal-500 hover:bg-teal-500/10"
            >
              <Icon
                className="mx-auto mb-3 text-teal-400"
                size={28}
              />

              <p className="font-medium text-white">
                {action.title}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}