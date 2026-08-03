import { useAuthStore } from "../../store/authStore";

export default function Greeting() {
  const user = useAuthStore((state) => state.user);

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) {
    greeting = "Good Morning";
  } else if (hour < 18) {
    greeting = "Good Afternoon";
  }

  const name =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Friend";

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">
        {greeting}, {name} 👋
      </h1>

      <p className="mt-2 text-slate-400">
        Keep your momentum. Every healthy decision counts.
      </p>
    </div>
  );
}