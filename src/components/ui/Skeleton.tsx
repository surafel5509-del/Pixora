import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, style }: { className?: string; style?: CSSProperties }) {
  return <div aria-hidden style={style} className={cn("skeleton rounded-xl", className)} />;
}

export function SkeletonCard({ height = 260 }: { height?: number }) {
  return (
    <div className="mb-4 break-inside-avoid">
      <Skeleton className="w-full" style={{ height }} />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="ml-auto h-3 w-10" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 12 }: { count?: number }) {
  const heights = [280, 200, 320, 240, 360, 210, 300, 260, 340, 230, 290, 250];
  return (
    <div aria-hidden className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} height={heights[index % heights.length]} />
      ))}
    </div>
  );
}
