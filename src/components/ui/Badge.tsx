import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BadgeTone = "neutral" | "brand" | "accent" | "success" | "warning" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-muted border-line",
  brand: "bg-brand/18 text-ink border-brand/40",
  accent: "bg-accent/12 text-accent border-accent/30",
  success: "bg-emerald-500/12 text-emerald-600 border-emerald-500/25 dark:text-emerald-400",
  warning: "bg-amber-500/14 text-amber-700 border-amber-500/30 dark:text-amber-400",
  danger: "bg-danger/12 text-danger border-danger/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold leading-none tracking-wide",
        TONES[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
