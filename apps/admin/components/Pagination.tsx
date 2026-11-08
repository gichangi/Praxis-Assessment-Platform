import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RowsPerPage } from "@/components/RowsPerPage";
import { cn } from "@/lib/utils";
import { pageCount, pageHref, rangeLabel, sizeParam } from "@/lib/pagination";

type Props = {
  page: number;
  total: number;
  pageSize: number;
  /** The size used when the URL doesn't say, so it can be left out of links. */
  defaultPageSize?: number;
  /** "forms", "team members"... names the control for screen readers. */
  noun: string;
  /** Pages kept in the URL: where they live, and the filters to keep. */
  basePath?: string;
  params?: Record<string, string | undefined>;
  /** Pages kept in state (client components). Use this or basePath. */
  onPageChange?: (page: number) => void;
  /** Offer a rows-per-page choice (URL-based lists only). */
  sizePicker?: boolean;
  className?: string;
};

/**
 * The footer under a list, laid out as: Rows per page: [5 ▾]   1–5 of 9   ‹ ›
 * Always shown, with the arrows greyed out when there is nowhere to go.
 */
export function Pagination({
  page,
  total,
  pageSize,
  defaultPageSize = pageSize,
  noun,
  basePath = "",
  params = {},
  onPageChange,
  sizePicker = !onPageChange,
  className,
}: Props) {
  if (total === 0) return null;
  const pages = pageCount(total, pageSize);
  // Every link keeps the filters and the chosen page size.
  const linkParams = { ...params, size: sizeParam(pageSize, defaultPageSize) };

  function Arrow({ to, label, disabled }: { to: number; label: string; disabled: boolean }) {
    const Icon = to < page ? ChevronLeft : ChevronRight;
    const style = cn(
      "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
      disabled ? "pointer-events-none text-border" : "text-text-main hover:bg-bg"
    );
    const icon = <Icon className="h-5 w-5" aria-hidden="true" />;
    if (onPageChange) {
      return (
        <button
          type="button"
          aria-label={label}
          disabled={disabled}
          onClick={() => onPageChange(to)}
          className={style}
        >
          {icon}
        </button>
      );
    }
    return (
      <Link
        href={pageHref(basePath, linkParams, to)}
        scroll={false}
        aria-label={label}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : undefined}
        className={style}
      >
        {icon}
      </Link>
    );
  }

  return (
    <nav
      aria-label={`${noun} pagination`}
      className={cn(
        "flex flex-wrap items-center justify-end gap-x-8 gap-y-2 text-sm text-muted",
        className
      )}
    >
      {sizePicker && (
        <RowsPerPage
          value={pageSize}
          defaultSize={defaultPageSize}
          basePath={basePath}
          params={params}
        />
      )}
      <span aria-live="polite" className="tabular-nums text-text-main">
        {rangeLabel(page, pageSize, total)}
      </span>
      <div className="-ms-3 flex items-center gap-1">
        <Arrow to={page - 1} label="Previous page" disabled={page <= 1} />
        <Arrow to={page + 1} label="Next page" disabled={page >= pages} />
      </div>
    </nav>
  );
}
