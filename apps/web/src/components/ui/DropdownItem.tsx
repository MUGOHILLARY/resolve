import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  children: ReactNode;
  onClick?: () => void;
};

export default function DropdownItem({
  icon,
  children,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 px-5 py-3 text-left text-slate-300 transition hover:bg-slate-800 hover:text-white"
    >
      {icon}

      <span>{children}</span>
    </button>
  );
}