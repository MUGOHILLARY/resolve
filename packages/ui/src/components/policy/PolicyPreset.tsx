interface PolicyPresetProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

export default function PolicyPreset({
  title,
  description,
  selected,
  onSelect,
}: PolicyPresetProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-5 text-left transition ${
        selected
          ? "border-blue-500 bg-blue-950"
          : "border-slate-700 bg-slate-900 hover:border-slate-500"
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        {selected && (
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            Selected
          </span>
        )}
      </div>

      <p className="mt-3 text-sm text-slate-400">
        {description}
      </p>
    </button>
  );
}