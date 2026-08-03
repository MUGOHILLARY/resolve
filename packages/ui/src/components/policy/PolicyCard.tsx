import React from "react";

interface PolicyCardProps {
  title: string;
  description: string;
  children?: React.ReactNode;
}

export default function PolicyCard({
  title,
  description,
  children,
}: PolicyCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg transition hover:border-blue-500">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {title}
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          {description}
        </p>
      </div>

      <div>{children}</div>
    </div>
  );
}