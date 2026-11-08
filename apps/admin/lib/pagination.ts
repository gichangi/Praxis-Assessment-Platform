/** Paging for lists. Pages are 1-based; the page number lives in the URL as ?page=N. */

export const PAGE_SIZE = 25;

/** Rows-per-page choices offered under a list. */
export const PAGE_SIZES = [5, 10, 25, 50, 100] as const;

/** The page size asked for in the URL (?size=N): one of the offered sizes, otherwise `fallback`. */
export function parsePageSize(raw: string | undefined | null, fallback: number): number {
  const n = Number.parseInt(raw ?? "", 10);
  return (PAGE_SIZES as readonly number[]).includes(n) ? n : fallback;
}

/** What to put in the URL for a page size: nothing when it is the default. */
export function sizeParam(size: number, fallback: number): string | undefined {
  return size === fallback ? undefined : String(size);
}

/** The page asked for in the URL: a whole number from 1, otherwise 1. */
export function parsePage(raw: string | undefined | null): number {
  const n = Number.parseInt(raw ?? "", 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function pageCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

/** The inclusive row range for a database query (Supabase `.range(from, to)`). */
export function rangeFor(page: number, size: number): [number, number] {
  return [(page - 1) * size, page * size - 1];
}

/** One page of an in-memory list. A page past the end shows the last page instead. */
export function pageSlice<T>(items: T[], page: number, size: number) {
  const pages = pageCount(items.length, size);
  const current = Math.min(Math.max(1, page), pages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: current,
    pages,
    total: items.length,
  };
}

/** A link to `page` on `basePath`, keeping the other filters. Page 1 has no ?page. */
export function pageHref(
  basePath: string,
  params: Record<string, string | undefined>,
  page: number
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v) q.set(k, v);
  if (page > 1) q.set("page", String(page));
  const s = q.toString();
  return s ? `${basePath}?${s}` : basePath;
}

/** "26–50 of 61". */
export function rangeLabel(page: number, size: number, total: number): string {
  if (total === 0) return "0 of 0";
  const from = (page - 1) * size + 1;
  return `${from}–${Math.min(page * size, total)} of ${total}`;
}
