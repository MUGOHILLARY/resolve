import JournalEditor from "../components/recovery/JournalEditor";

export default function Recovery() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          Recovery Journal
        </h1>

        <p className="mt-2 text-slate-400">
          Track your recovery one day at a time.
        </p>
      </div>

      <JournalEditor />
    </div>
  );
}