export default function Loading() {
  return (
    <div className="page-container" role="status" aria-label="Loading workspace">
      <div className="h-3 w-28 rounded bg-border motion-safe:animate-pulse" />
      <div className="!mt-3 h-8 w-60 rounded-lg bg-border motion-safe:animate-pulse" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {[1, 2, 3, 4].map((key) => (
          <div
            key={key}
            className="h-36 rounded-card border border-border bg-surface motion-safe:animate-pulse"
          />
        ))}
      </div>
      <div className="h-80 rounded-card border border-border bg-surface motion-safe:animate-pulse" />
      <span className="sr-only">Loading workspace…</span>
    </div>
  );
}
