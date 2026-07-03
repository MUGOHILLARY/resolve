import { Flame } from "lucide-react";
import { motion } from "framer-motion";

import { useStreakStore } from "../../store/streakStore";

export default function StreakFlame() {
  const streak = useStreakStore((state) => state.streak);

  let color = "text-slate-500";
  let glow = "";

  if (streak >= 1) {
    color = "text-orange-500";
    glow = "drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]";
  }

  if (streak >= 7) {
    color = "text-amber-400";
    glow = "drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]";
  }

  if (streak >= 30) {
    color = "text-teal-400";
    glow = "drop-shadow-[0_0_10px_rgba(45,212,191,0.9)]";
  }

  if (streak >= 100) {
    color = "text-purple-400";
    glow = "drop-shadow-[0_0_14px_rgba(192,132,252,1)]";
  }

  return (
    <motion.div
      animate={{
        scale: [1, 1.08, 1],
        rotate: [0, -3, 3, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
      }}
      className="flex items-center gap-2"
    >
      <Flame size={24} className={`${color} ${glow}`} />

      <span className="font-semibold text-white">
        {streak} Day{streak !== 1 ? "s" : ""} Streak
      </span>
    </motion.div>
  );
}