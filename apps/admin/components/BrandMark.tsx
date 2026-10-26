import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded bg-primary text-white",
        className
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 28 28" className="h-6 w-6" fill="none">
        <path
          d="M5 20V11M14 20V5M23 20V9"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M4 25H24"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity=".5"
        />
      </svg>
    </span>
  );
}
