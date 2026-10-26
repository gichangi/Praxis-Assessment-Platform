import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="text-sm font-semibold text-text-main">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted">{description}</p>
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
