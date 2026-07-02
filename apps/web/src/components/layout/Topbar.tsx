export default function Topbar() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 px-8">
      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <span className="text-sm text-slate-400">
        Welcome back 👋
      </span>
    </header>
  );
}