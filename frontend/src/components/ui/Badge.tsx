import React from "react";
import clsx from "clsx";

type BadgeColor = "green" | "yellow" | "red" | "blue" | "gray" | "purple";

interface BadgeProps {
  color?: BadgeColor;
  children: React.ReactNode;
  className?: string;
}

const colors: Record<BadgeColor, string> = {
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  yellow: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  red: "bg-red-500/15 text-red-400 border-red-500/30",
  blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  gray: "bg-white/5 text-slate-400 border-white/10",
  purple: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
};

export const Badge: React.FC<BadgeProps> = ({
  color = "gray",
  children,
  className,
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border",
        colors[color],
        className,
      )}
    >
      {children}
    </span>
  );
};
