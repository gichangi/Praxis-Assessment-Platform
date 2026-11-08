"use client";
import { useState, useCallback } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  useToastListener,
} from "@/components/ui/toast";

type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((opts: Omit<ToastItem, "id">) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, ...opts }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  useToastListener(add);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant}>
          {t.variant === "success" && (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
          )}
          {t.variant === "destructive" && (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
          )}
          <div className="flex-1">
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
