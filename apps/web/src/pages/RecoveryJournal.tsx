import JournalToolbar from "../components/recovery/JournalToolbar";
import MoodSelector from "../components/recovery/MoodSelector";
import JournalEditor from "../components/recovery/JournalEditor";
import JournalList from "../components/recovery/JournalList";

export default function RecoveryJournal() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Journal
        </h1>

        <p className="mt-2 text-slate-400">
          Record your thoughts and emotions every day.
        </p>
      </div>

      <JournalToolbar />

      <MoodSelector />

      <JournalEditor />

      <JournalList />
    </div>
  );
}