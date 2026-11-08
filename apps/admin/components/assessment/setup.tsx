import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Back link, title and one line of guidance at the top of the setup panel. */
export function AssessmentIntro({
  backHref,
  backLabel,
  title,
  description,
}: {
  backHref: string;
  backLabel: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {backLabel}
      </Link>
      <h1 className="mt-4 font-serif text-[32px] leading-tight tracking-tight">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
    </div>
  );
}

export const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  so: "Somali",
  ar: "Arabic",
};

/** The look shared by every setup control, so editable and read-only fields match. */
export const FIELD_BOX =
  "flex h-12 w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 text-start text-sm text-text-main";

/** A numbered label above a setup control. */
export function SetupField({
  step,
  label,
  htmlFor,
  children,
}: {
  step: number;
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
          {step}
        </span>
        {label}
      </label>
      {children}
    </div>
  );
}

/** A read-only setup value, for an assessment whose form and place are already fixed. */
export function SetupStatic({
  step,
  label,
  icon,
  children,
  aside,
}: {
  step: number;
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <SetupField step={step} label={label}>
      <div className={cn(FIELD_BOX, "bg-bg/60")}>
        {icon}
        <span className="min-w-0 flex-1 truncate font-medium">{children}</span>
        {aside && <span className="shrink-0 text-xs text-muted">{aside}</span>}
      </div>
    </SetupField>
  );
}
