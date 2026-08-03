interface Props {
  saving: boolean;
  onSave: () => void;
}

export default function SaveProfileButton({
  saving,
  onSave,
}: Props) {
  return (
    <div className="flex justify-end">

      <button
        onClick={onSave}
        disabled={saving}
        className="rounded-xl bg-teal-500 px-8 py-4 font-semibold text-slate-950 transition hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Recovery Profile"}
      </button>

    </div>
  );
}