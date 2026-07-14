import type { ReactNode } from "react";
import Card from "../ui/Card";

type JournalCardProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
};

export default function JournalCard({
  children,
  title,
  subtitle,
}: JournalCardProps) {
  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">
          {title}
        </h2>

        {subtitle && (
          <p className="mt-2 text-slate-400">
            {subtitle}
          </p>
        )}
      </div>

      {children}
    </Card>
  );
}