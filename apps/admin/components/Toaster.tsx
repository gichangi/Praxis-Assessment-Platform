"use client";
import { useState, useCallback } from "react";
import {
  ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose,
  useToastListener,
} from "@/components/ui/toast";

type ToastItem = { id: number; title: string; description?: string; variant?: "default" | "destructive" };

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
