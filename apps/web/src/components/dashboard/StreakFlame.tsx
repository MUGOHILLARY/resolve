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

  if (streak >= 4) {
    color = "text-amber-400";
    glow = "drop-shadow-[0_0_6px_rgba(251,191,36,0.7)]";
  }

  if (streak >= 8) {
    color = "text-yellow-400";
    glow = "drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]";
  }

  if (streak >= 15) {
    color = "text-lime-400";
    glow = "drop-shadow-[0_0_10px_rgba(163,230,53,0.8)]";
  }

  if (streak >= 30) {
    color = "text-teal-400";
    glow = "drop-shadow-[0_0_12px_rgba(45,212,191,0.9)]";
  }

  if (streak >= 60) {
    color = "text-cyan-400";
    glow = "drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]";
  }

  if (streak >= 100) {
    color = "text-purple-400";
    glow = "drop-shadow-[0_0_18px_rgba(192,132,252,1)]";
  }

  return (
    <div className="flex items-center gap-2">
      <motion.div
        animate={{
          scale: [1, 1.08, 1],
          rotate: [0, -4, 4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <Flame
          size={24}
          className={`${color} ${glow} transition-all duration-500`}
        />
      </motion.div>

      <span className="font-semibold text-white">
        {streak} Day{streak !== 1 ? "s" : ""} Streak
      </span>
    </div>
  );
}