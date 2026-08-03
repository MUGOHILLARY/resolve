import clsx from "clsx";

type Variant =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  variant?: Variant;
}

export default function Badge({
  children,
  variant = "neutral",
}: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",

        {
          "bg-green-500/20 text-green-400":
            variant === "success",

          "bg-yellow-500/20 text-yellow-400":
            variant === "warning",

          "bg-red-500/20 text-red-400":
            variant === "error",

          "bg-cyan-500/20 text-cyan-400":
            variant === "info",

          "bg-slate-700 text-slate-300":
            variant === "neutral",
        }
      )}
    >
      {children}
    </span>
  );
}