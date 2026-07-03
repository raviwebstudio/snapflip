import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { useToastStore } from "../../store";
import type { Toast } from "../../store";

export default function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => {
        const Icon = getIcon(toast.type);
        const styles = getStyles(toast.type);

        return (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-2xl border bg-slate-950 p-4 shadow-2xl transition-all duration-300 animate-slide-in ${styles.border}`}
          >
            {/* Type Indicator Icon */}
            <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${styles.bg} ${styles.text}`}>
              <Icon className="h-4 w-4" />
            </div>

            {/* Content text */}
            <div className="flex-1 text-left">
              <p className="text-xs font-semibold text-slate-200 leading-normal">{toast.message}</p>
            </div>

            {/* Clear Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 transition-colors shrink-0 mt-0.5 cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function getIcon(type: Toast["type"]) {
  switch (type) {
    case "success":
      return CheckCircle2;
    case "warning":
      return AlertTriangle;
    case "error":
      return AlertCircle;
    case "info":
    default:
      return Info;
  }
}

function getStyles(type: Toast["type"]) {
  switch (type) {
    case "success":
      return {
        border: "border-emerald-500/25",
        text: "text-emerald-400",
        bg: "bg-emerald-500/10"
      };
    case "error":
      return {
        border: "border-rose-500/25",
        text: "text-rose-400",
        bg: "bg-rose-500/10"
      };
    case "warning":
      return {
        border: "border-amber-500/25",
        text: "text-amber-400",
        bg: "bg-amber-500/10"
      };
    case "info":
    default:
      return {
        border: "border-sky-500/25",
        text: "text-sky-400",
        bg: "bg-sky-500/10"
      };
  }
}
