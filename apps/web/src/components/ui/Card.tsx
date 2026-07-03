import { ReactNode } from "react";

type CardProps = {
  children: ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`
        rounded-3xl
        border
        border-slate-800
        bg-slate-900
        p-6
        shadow-xl
        transition-all
        duration-300
        hover:border-teal-500/40
        hover:shadow-teal-500/10
        ${className}
      `}
    >
      {children}
    </div>
  );
}