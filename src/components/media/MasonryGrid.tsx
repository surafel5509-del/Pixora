import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const COLUMN_CLASSES: Record<number, string> = {
  0: "columns-2 sm:columns-3 lg:columns-4 xl:columns-5",
  1: "columns-1 sm:columns-2",
  2: "columns-2",
  3: "columns-2 md:columns-3",
  4: "columns-2 md:columns-3 lg:columns-4",
  5: "columns-2 sm:columns-3 lg:columns-4 xl:columns-5",
  6: "columns-3 sm:columns-4 lg:columns-5 xl:columns-6",
};

/** CSS-columns masonry: no JS layout, no scroll jank, fully responsive. */
export function MasonryGrid({
  columns = 0,
  gap = "gap-4",
  className,
  children,
}: {
  columns?: number;
  gap?: string;
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn(COLUMN_CLASSES[columns] ?? COLUMN_CLASSES[0], gap, className)}>{children}</div>;
}
