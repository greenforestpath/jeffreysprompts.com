"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextValue {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    return {
      success: () => {},
      error: () => {},
      info: () => {},
    };
  }
  return context;
}

const icons = {
  success: Check,
  error: X,
  info: Info,
  warning: AlertTriangle,
};

const colors = {
  success: "text-emerald-500 bg-emerald-500/10",
  error: "text-rose-500 bg-rose-500/10",
  info: "text-sky-500 bg-sky-500/10",
  warning: "text-amber-500 bg-amber-500/10",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: () => void }) {
  const Icon = icons[toast.type];
  const duration = toast.duration ?? 3000;

  React.useEffect(() => {
    const timer = setTimeout(onRemove, duration);
    return () => clearTimeout(timer);
  }, [duration, onRemove]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 50, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "relative w-full max-w-sm overflow-hidden",
        "rounded-xl border shadow-lg",
        "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl",
        "border-neutral-200/50 dark:border-neutral-800/50"
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
          className={cn("shrink-0 size-9 rounded-full flex items-center justify-center", colors[toast.type])}
        >
          <Icon className="size-5" />
        </motion.div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            {toast.title}
          </p>
          {toast.message && (
            <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2">
              {toast.message}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed z-[9999] top-4 right-4 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 3).map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback((type: ToastType, title: string, message?: string) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [{ id, type, title, message }, ...prev]);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = React.useMemo(
    () => ({
      success: (title: string, message?: string) => addToast("success", title, message),
      error: (title: string, message?: string) => addToast("error", title, message),
      info: (title: string, message?: string) => addToast("info", title, message),
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}
