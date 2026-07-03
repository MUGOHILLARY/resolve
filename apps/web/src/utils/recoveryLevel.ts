export type RecoveryLevel = {
  title: string;
  message: string;
  progress: number;
  color: string;
};

export function getRecoveryLevel(streak: number): RecoveryLevel {
  if (streak === 0) {
    return {
      title: "🌱 New Beginning",
      message: "Every journey starts with a single step.",
      progress: 0,
      color: "bg-slate-500",
    };
  }

  if (streak < 7) {
    return {
      title: "🚶 Explorer",
      message: "You're building momentum.",
      progress: (streak / 7) * 100,
      color: "bg-orange-500",
    };
  }

  if (streak < 30) {
    return {
      title: "🛠 Builder",
      message: "Consistency is becoming a habit.",
      progress: (streak / 30) * 100,
      color: "bg-teal-500",
    };
  }

  if (streak < 100) {
    return {
      title: "🏅 Champion",
      message: "Your commitment is paying off.",
      progress: (streak / 100) * 100,
      color: "bg-emerald-500",
    };
  }

  if (streak < 365) {
    return {
      title: "💎 Legend",
      message: "An inspiring example of perseverance.",
      progress: (streak / 365) * 100,
      color: "bg-purple-500",
    };
  }

  return {
    title: "👑 Master",
    message: "A full year of consistent recovery.",
    progress: 100,
    color: "bg-yellow-500",
  };
}