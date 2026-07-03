type StatCardProps = {
  title: string;
  value: string;
  subtitle: string;
};

export default function StatCard({
  title,
  value,
  subtitle,
}: StatCardProps) {
  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 transition duration-300 hover:-translate-y-1 hover:border-teal-500">
      <p className="text-sm uppercase tracking-wide text-slate-400">
        {title}
      </p>

      <h2 className="mt-4 text-4xl font-bold text-white">
        {value}
      </h2>

      <p className="mt-3 text-sm text-teal-400">
        {subtitle}
      </p>
    </div>
  );
}