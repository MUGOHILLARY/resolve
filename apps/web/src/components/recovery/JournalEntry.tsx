import { Trash2 } from "lucide-react";

import type { JournalEntry as JournalEntryType } from "../../types/journal";
import { useJournalStore } from "../../store/journalStore";

type Props = {
  entry: JournalEntryType;
};

const moodEmoji = {
  great: "😁",
  good: "😊",
  okay: "😐",
  bad: "😔",
  terrible: "😞",
};

export default function JournalEntry({ entry }: Props) {
  const deleteEntry = useJournalStore((state) => state.deleteEntry);

  async function handleDelete() {
    try {
      await deleteEntry(entry.id);
    } catch (error) {
      console.error("Failed to delete journal:", error);
    }
  }

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition hover:border-teal-500/40">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">
              {moodEmoji[entry.mood]}
            </span>

            <div>
              <h3 className="text-lg font-semibold text-white">
                {entry.title}
              </h3>

              <p className="text-sm text-slate-400">
                {entry.date}
              </p>
            </div>
          </div>

          <p className="mt-4 leading-7 text-slate-300">
            {entry.content}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDelete}
          className="rounded-xl p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 size={20} />
        </button>
      </div>
    </div>
  );
}