import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

type Variant =
  | "primary"
  | "secondary"
  | "danger"
  | "ghost";

type Size =
  | "sm"
  | "md"
  | "lg";

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={clsx(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",

        {
          "bg-teal-500 text-slate-950 hover:bg-teal-400":
            variant === "primary",

          "border border-slate-700 bg-slate-900 text-white hover:border-teal-500":
            variant === "secondary",

          "bg-red-500 text-white hover:bg-red-600":
            variant === "danger",

          "text-slate-300 hover:bg-slate-800":
            variant === "ghost",

          "px-3 py-2 text-sm":
            size === "sm",

          "px-4 py-3":
            size === "md",

          "px-6 py-4 text-lg":
            size === "lg",
        },

        className
      )}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        leftIcon
      )}

      {children}

      {!loading && rightIcon}
    </button>
  );
}