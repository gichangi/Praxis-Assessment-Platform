"use client";
import { useRouter } from "next/navigation";
import { PAGE_SIZES, pageHref, sizeParam } from "@/lib/pagination";

/** "Rows per page: 5 ▾". Choosing a size reloads the list on its first page. */
export function RowsPerPage({
  value,
  defaultSize,
  basePath,
  params,
}: {
  value: number;
  defaultSize: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  const router = useRouter();
  // An unusual default (not among the offered sizes) still has to be selectable.
  const sizes = [...new Set<number>([...PAGE_SIZES, defaultSize, value])].sort((a, b) => a - b);

  return (
    <label className="flex items-center gap-3">
      <span>Rows per page:</span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(e) =>
            router.push(
              pageHref(
                basePath,
                { ...params, size: sizeParam(Number(e.target.value), defaultSize) },
                1
              ),
              { scroll: false }
            )
          }
          className="cursor-pointer appearance-none rounded bg-transparent py-1 pe-5 ps-1 text-sm text-text-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {sizes.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        {/* A small filled caret, drawn here because the native one is hidden. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 10 5"
          className="pointer-events-none absolute end-0.5 h-1.5 w-2.5 fill-current text-muted"
        >
          <path d="M0 0h10L5 5z" />
        </svg>
      </span>
    </label>
  );
}
