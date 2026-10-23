import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  tone = "neutral",
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  tone?: "neutral" | "danger";
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-3xl border border-dashed px-6 py-16 text-center",
        tone === "danger" ? "border-danger/30 bg-danger/5" : "border-line bg-surface/60",
        className,
      )}
    >
      {icon ? (
        <span
          className={cn(
            "mb-4 grid h-14 w-14 place-items-center rounded-2xl",
            tone === "danger" ? "bg-danger/10 text-danger" : "bg-surface-2 text-muted",
          )}
        >
          {icon}
        </span>
      ) : null}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p> : null}
      {action ? <div className="mt-6 flex flex-wrap items-center justify-center gap-3">{action}</div> : null}
    </div>
  );
}
