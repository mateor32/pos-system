import React from "react";
import clsx from "clsx";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  hint,
  error,
  className,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={clsx(
          "bg-white/5 border rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all duration-200",
          "focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30",
          error ? "border-red-500/50" : "border-white/10",
          className,
        )}
        {...props}
      />
      {hint && !error && <span className="text-xs text-slate-500">{hint}</span>}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
};
