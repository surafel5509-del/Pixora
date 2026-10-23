import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function BrandMark({ size = 34 }: { size?: number }) {
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-xl bg-brand text-brand-ink shadow-sm"
      style={{ width: size, height: size }}
    >
      <Sparkles size={Math.round(size * 0.55)} strokeWidth={2.4} />
    </span>
  );
}

export function Brand({
  collapsed = false,
  to = "/",
  className,
}: {
  collapsed?: boolean;
  to?: string;
  className?: string;
}) {
  return (
    <Link
      to={to}
      aria-label="Pixora home"
      className={cn("group flex items-center gap-2.5 rounded-xl px-1 py-1", className)}
    >
      <BrandMark />
      {!collapsed ? (
        <span className="font-display text-[1.375rem] font-extrabold leading-none tracking-tight text-ink">
          Pixora
        </span>
      ) : null}
    </Link>
  );
}
