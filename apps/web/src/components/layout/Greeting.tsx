export default function Greeting() {
  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        {greeting}, Hillary 👋
      </h1>

      <p className="mt-2 text-slate-400">
        Keep your momentum. Every healthy decision counts.
      </p>
    </div>
  );
}