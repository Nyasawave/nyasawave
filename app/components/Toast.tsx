"use client";

import { useState, useEffect } from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export default function Toast({ message, type = "info", duration = 3000, onClose }: { message: string; type?: ToastType; duration?: number; onClose?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        setVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!visible) return null;

  const bgColor = {
    success: "bg-emerald-900/80 border-emerald-600/50",
    error: "bg-red-900/80 border-red-600/50",
    info: "bg-blue-900/80 border-blue-600/50",
    warning: "bg-amber-900/80 border-amber-600/50",
  }[type];

  const textColor = {
    success: "text-emerald-300",
    error: "text-red-300",
    info: "text-blue-300",
    warning: "text-amber-300",
  }[type];

  return (
    <div className={`fixed bottom-6 right-6 rounded-lg border ${bgColor} ${textColor} px-4 py-3 text-sm max-w-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300 z-50`}>
      {message}
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: { toasts: ToastMessage[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 space-y-3 z-50">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  );
}
