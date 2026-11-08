import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Tone } from "@/lib/forms";

const STYLES: Record<Tone, { box: string; icon: string; Icon: typeof Info }> = {
  success: {
    box: "border-emerald-200 bg-emerald-50 text-emerald-900",
    icon: "text-emerald-600",
    Icon: CheckCircle2,
  },
  warning: {
    box: "border-amber-200 bg-amber-50 text-amber-900",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  neutral: { box: "border-border bg-surface text-text-main", icon: "text-muted", Icon: Info },
};

/** One-sentence status with an optional next-step action. */
export function StatusBanner({
  tone,
  title,
  children,
  action,
  className,
}: {
  tone: Tone;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  const { box, icon, Icon } = STYLES[tone];
  return (
    <div
      role="status"
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-3 rounded-card border px-5 py-4",
        box,
        className
      )}
    >
      <Icon className={cn("h-5 w-5 shrink-0", icon)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        {children && <p className="mt-0.5 text-[13px] leading-relaxed opacity-85">{children}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
