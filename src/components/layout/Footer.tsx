import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Github, Sparkles } from "lucide-react";
import { BrandMark } from "@/components/layout/Brand";
import { FOOTER_COLUMNS } from "@/data/navigation";
import { fetchHealth } from "@/lib/media-api";
import { SITE } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { HealthResponse } from "@shared/types";

function StatusPill() {
  const [health, setHealth] = useState<HealthResponse | null>(null);

  useEffect(() => {
    let active = true;
    void fetchHealth().then((response) => {
      if (active) setHealth(response);
    });
    return () => {
      active = false;
    };
  }, []);

  const mode = health?.provider.mode ?? "unknown";
  const tone = mode === "live" ? "bg-emerald-500" : mode === "demo" ? "bg-amber-500" : "bg-muted";

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.6875rem] font-semibold text-muted">
      <span className={cn("h-1.5 w-1.5 rounded-full", tone)} aria-hidden />
      {mode === "live" ? "Live catalogue" : mode === "demo" ? "Sample library" : "Status unknown"}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-surface/60">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_repeat(4,1fr)] lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2.5">
            <BrandMark size={30} />
            <span className="font-display text-lg font-extrabold tracking-tight text-ink">{SITE.name}</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {SITE.name} is a calm, fast home for visual research. Collect references, build boards and get
            back to making — without a subscription.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <StatusPill />
            <a
              href="https://github.com/surafel5509-del/Pixora"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-[0.6875rem] font-semibold text-muted transition hover:text-ink"
            >
              <Github size={13} aria-hidden /> Source
            </a>
          </div>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <p className="eyebrow mb-3.5">{column.title}</p>
            <ul className="flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted transition hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-line px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-3 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {SITE.name}. Made for the endlessly curious.
          </p>
          <p className="inline-flex items-center gap-1.5">
            <Sparkles size={12} className="text-brand" aria-hidden />
            Free to explore · No subscription required
          </p>
        </div>
      </div>
    </footer>
  );
}
