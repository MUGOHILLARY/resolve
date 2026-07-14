import type { Mood } from "../../types/journal";
import { moods } from "../../constants/moods";

type MoodSelectorProps = {
  value?: Mood;
  onChange: (mood: Mood) => void;
};

export default function MoodSelector({
  value,
  onChange,
}: MoodSelectorProps) {
  return (
    <div>
      <p className="mb-4 text-sm font-medium text-slate-400">
        How are you feeling today?
      </p>

      <div className="grid grid-cols-5 gap-4">
        {moods.map((item) => (
          <button
            key={item.mood}
            type="button"
            onClick={() => onChange(item.mood)}
            className={`rounded-2xl border p-4 transition ${
              value === item.mood
                ? "border-teal-500 bg-teal-500/10"
                : "border-slate-800 bg-slate-900"
            }`}
          >
            <div className="text-4xl">{item.emoji}</div>

            <p className="mt-2 text-sm text-slate-300">
              {item.label}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}