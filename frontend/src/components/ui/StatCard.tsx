import React from "react";
import clsx from "clsx";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  color?: "indigo" | "emerald" | "yellow" | "red";
}

const colors = {
  indigo: {
    icon: "bg-indigo-500/15 text-indigo-400",
    trend: "text-indigo-400",
  },
  emerald: {
    icon: "bg-emerald-500/15 text-emerald-400",
    trend: "text-emerald-400",
  },
  yellow: {
    icon: "bg-yellow-500/15 text-yellow-400",
    trend: "text-yellow-400",
  },
  red: { icon: "bg-red-500/15 text-red-400", trend: "text-red-400" },
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  trendLabel,
  color = "indigo",
}) => {
  const c = colors[color];
  return (
    <div className="card p-5 flex flex-col gap-3 hover:border-indigo-500/30 transition-all duration-200">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </span>
        <div className={clsx("p-2 rounded-lg", c.icon)}>{icon}</div>
      </div>
      <div className="font-mono text-2xl font-bold text-slate-100">{value}</div>
      {trend !== undefined && (
        <div
          className={clsx(
            "text-xs",
            trend >= 0 ? "text-emerald-400" : "text-red-400",
          )}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend).toFixed(1)}% {trendLabel}
        </div>
      )}
    </div>
  );
};
