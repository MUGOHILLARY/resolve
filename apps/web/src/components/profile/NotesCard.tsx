interface Props {
  notes: string;

  setNotes: (value: string) => void;
}

export default function NotesCard({
  notes,
  setNotes,
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

      <h2 className="mb-6 text-xl font-semibold text-white">
        📝 Personal Notes
      </h2>

      <textarea
        rows={8}
        value={notes}
        onChange={(e) =>
          setNotes(e.target.value)
        }
        placeholder="Anything you'd like your AI coach to know..."
        className="w-full rounded-xl border border-slate-700 bg-slate-800 p-4 text-white outline-none transition focus:border-teal-500"
      />

    </div>
  );
}