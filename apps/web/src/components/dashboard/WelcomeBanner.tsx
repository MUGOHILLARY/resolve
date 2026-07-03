export default function WelcomeBanner() {
  return (
    <section className="rounded-3xl bg-gradient-to-r from-teal-500 via-cyan-500 to-emerald-500 p-10 text-slate-950 shadow-xl">
      <p className="text-sm font-semibold uppercase tracking-widest">
        Resolve
      </p>

      <h1 className="mt-3 text-5xl font-bold">
        Welcome Back 👋
      </h1>

      <p className="mt-4 max-w-2xl text-lg">
        Every healthy decision strengthens your recovery.
        Stay focused, stay consistent, and celebrate your progress.
      </p>
    </section>
  );
}