type ProgressBarProps = {
  value: number;
  color?: string;
};

export default function ProgressBar({
  value,
  color = "bg-teal-500",
}: ProgressBarProps) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{
          width: `${Math.min(value, 100)}%`,
        }}
      />
    </div>
  );
}