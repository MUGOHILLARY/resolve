import { Search } from "lucide-react";
import type { Mood } from "../../types/journal";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  mood: Mood | "all";
  onMoodChange: (value: Mood | "all") => void;
};

export default function JournalToolbar({
  search,
  onSearchChange,
  mood,
  onMoodChange,
}: Props) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />

          <input
            type="text"
            placeholder="Search journal..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-11 pr-4 text-white outline-none transition focus:border-teal-500"
          />
        </div>

        <select
          value={mood}
          onChange={(e) =>
            onMoodChange(e.target.value as Mood | "all")
          }
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-teal-500"
        >
          <option value="all">All Moods</option>
          <option value="great">😁 Great</option>
          <option value="good">😊 Good</option>
          <option value="okay">😐 Okay</option>
          <option value="bad">😔 Bad</option>
          <option value="terrible">😞 Terrible</option>
        </select>
      </div>
    </div>
  );
}