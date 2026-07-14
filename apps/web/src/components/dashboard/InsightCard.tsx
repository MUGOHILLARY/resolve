import { ReactNode } from "react";

import Card from "../ui/Card";
import ProgressBar from "../ui/ProgressBar";

type InsightCardProps = {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
  trend?: string;
  progress?: number;
  progressColor?: string;
};

export default function InsightCard({
  icon,
  title,
  value,
  subtitle,
  trend,
  progress,
  progressColor = "bg-teal-500",
}: InsightCardProps) {
  return (
    <Card className="group hover:-translate-y-1 transition-all duration-300">
      {/* Top Section */}
      <div className="flex items-center justify-between">
        <div className="rounded-2xl bg-slate-800 p-3 text-teal-400 transition-colors duration-300 group-hover:bg-teal-500/10">
          {icon}
        </div>

        {trend && (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
            {trend}
          </span>
        )}
      </div>

      {/* Main Content */}
      <div className="mt-6">
        <p className="text-sm font-medium text-slate-400">
          {title}
        </p>

        <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
          {value}
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {subtitle}
        </p>
      </div>

      {/* Progress */}
      {progress !== undefined && (
        <div className="mt-6">
          <ProgressBar
            value={progress}
            color={progressColor}
          />
        </div>
      )}
    </Card>
  );
}