import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "warning" | "info";

interface ToastProps {
  type: ToastType;
  message: string;
  onDismiss: () => void;
}

const icons = {
  success: <CheckCircle size={16} className="text-emerald-400" />,
  error: <XCircle size={16} className="text-red-400" />,
  warning: <AlertTriangle size={16} className="text-yellow-400" />,
  info: <CheckCircle size={16} className="text-blue-400" />,
};

const styles = {
  success: "border-emerald-500/30 bg-emerald-500/10",
  error: "border-red-500/30 bg-red-500/10",
  warning: "border-yellow-500/30 bg-yellow-500/10",
  info: "border-blue-500/30 bg-blue-500/10",
};

export const Toast: React.FC<ToastProps> = ({ type, message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={clsx(
        "flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl slide-in",
        "bg-[#13131f] text-sm text-slate-200 min-w-[280px] max-w-sm",
        styles[type],
      )}
    >
      {icons[type]}
      <span className="flex-1">{message}</span>
      <button
        onClick={onDismiss}
        className="text-slate-500 hover:text-slate-300"
      >
        <X size={14} />
      </button>
    </div>
  );
};

// Toast container & manager
interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

let toastHandler: ((type: ToastType, message: string) => void) | null = null;

export function showToast(type: ToastType, message: string) {
  if (toastHandler) toastHandler(type, message);
}

export const ToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    toastHandler = (type, message) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type, message }]);
    };
    return () => {
      toastHandler = null;
    };
  }, []);

  const dismiss = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          type={toast.type}
          message={toast.message}
          onDismiss={() => dismiss(toast.id)}
        />
      ))}
    </div>
  );
};
