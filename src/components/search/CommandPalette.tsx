import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bookmark,
  CornerDownLeft,
  Folder,
  LogIn,
  LogOut,
  MoonStar,
  Plus,
  Search,
  Sun,
  TrendingUp,
  Upload,
} from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { fetchSuggestions } from "@/lib/media-api";
import { useAuth } from "@/context/AuthProvider";
import { useLibrary } from "@/context/LibraryProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useUI } from "@/context/UIProvider";
import { CATEGORIES, TRENDING_TOPICS } from "@shared/taxonomy";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/data/navigation";
import { cn } from "@/lib/utils";

interface Command {
  id: string;
  label: string;
  section: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  keywords?: string;
  run: () => void;
}

export function CommandPalette() {
  const { commandOpen, closeCommand, toggleCommand, openAuth } = useUI();
  const navigate = useNavigate();
  const { resolvedTheme, toggleTheme } = useSettings();
  const { recentSearches } = useLibrary();
  const { user, signOut } = useAuth();

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounced = useDebouncedValue(query, 200);

  useKeyboardShortcuts({ "mod+k": toggleCommand, "/": () => !commandOpen && toggleCommand() });

  useEffect(() => {
    if (!commandOpen) {
      setQuery("");
      setActiveIndex(0);
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(timer);
  }, [commandOpen]);

  useEffect(() => {
    const term = debounced.trim();
    if (!commandOpen || term.length < 2) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    void fetchSuggestions(term, controller.signal)
      .then((results) => setSuggestions(results.map((entry) => entry.label)))
      .catch(() => setSuggestions([]));
    return () => controller.abort();
  }, [debounced, commandOpen]);

  const commands = useMemo<Command[]>(() => {
    const go = (to: string) => () => {
      closeCommand();
      void navigate(to);
    };

    const search = (term: string) => () => {
      closeCommand();
      void navigate(`/search?q=${encodeURIComponent(term)}`);
    };

    const items: Command[] = [
      ...PRIMARY_NAV.map((item) => ({
        id: `nav-${item.to}`,
        label: item.label,
        section: "Navigate",
        icon: item.icon as Command["icon"],
        keywords: item.description,
        run: go(item.to),
      })),
      ...SECONDARY_NAV.map((item) => ({
        id: `nav2-${item.to}`,
        label: item.label,
        section: "Navigate",
        icon: item.icon as Command["icon"],
        keywords: item.description,
        run: go(item.to),
      })),
      ...CATEGORIES.slice(1).map((category) => ({
        id: `cat-${category.slug}`,
        label: category.label,
        section: "Categories",
        icon: TrendingUp as Command["icon"],
        keywords: `${category.blurb} ${category.query}`,
        run: go(`/explore?category=${category.slug}`),
      })),
      {
        id: "action-contribute",
        label: "Contribute media",
        section: "Actions",
        icon: Upload as Command["icon"],
        run: go("/contribute"),
      },
      {
        id: "action-theme",
        label: resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme",
        section: "Actions",
        icon: (resolvedTheme === "dark" ? Sun : MoonStar) as Command["icon"],
        run: () => {
          toggleTheme();
          closeCommand();
        },
      },
      {
        id: "action-new-board",
        label: "Create a board",
        section: "Actions",
        icon: Folder as Command["icon"],
        run: go("/boards"),
      },
      user
        ? {
            id: "action-signout",
            label: "Sign out",
            section: "Account",
            icon: LogOut as Command["icon"],
            run: () => {
              void signOut();
              closeCommand();
            },
          }
        : {
            id: "action-signin",
            label: "Sign in / create account",
            section: "Account",
            icon: LogIn as Command["icon"],
            run: () => {
              closeCommand();
              openAuth("signin");
            },
          },
    ];

    if (recentSearches.length) {
      items.push(
        ...recentSearches.slice(0, 5).map((entry) => ({
          id: `recent-${entry.term}`,
          label: entry.term,
          section: "Recent",
          icon: Search as Command["icon"],
          run: search(entry.term),
        })),
      );
    }

    items.push(
      ...suggestions.map((term) => ({
        id: `suggest-${term}`,
        label: term,
        section: "Suggestions",
        icon: Bookmark as Command["icon"],
        run: search(term),
      })),
      ...TRENDING_TOPICS.slice(0, 6).map((topic) => ({
        id: `trend-${topic}`,
        label: topic,
        section: "Trending",
        icon: TrendingUp as Command["icon"],
        run: search(topic),
      })),
    );

    return items;
  }, [
    closeCommand,
    navigate,
    openAuth,
    recentSearches,
    resolvedTheme,
    signOut,
    suggestions,
    toggleTheme,
    user,
  ]);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return commands;
    return commands.filter((command) =>
      `${command.label} ${command.keywords ?? ""} ${command.section}`.toLowerCase().includes(term),
    );
  }, [commands, query]);

  const grouped = useMemo(() => {
    const groups = new Map<string, { command: Command; index: number }[]>();
    filtered.forEach((command, index) => {
      const bucket = groups.get(command.section) ?? [];
      bucket.push({ command, index });
      groups.set(command.section, bucket);
    });
    return [...groups.entries()];
  }, [filtered]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!commandOpen) return null;

  const runActive = () => filtered[activeIndex]?.run();

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[12vh]">
      <div
        role="presentation"
        className="absolute inset-0 animate-fade-in bg-ink/50 backdrop-blur-sm"
        onMouseDown={closeCommand}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="relative z-10 w-full max-w-xl animate-scale-in overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((index) => (index + 1) % Math.max(1, filtered.length));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((index) => (index - 1 + filtered.length) % Math.max(1, filtered.length));
          } else if (event.key === "Enter") {
            event.preventDefault();
            runActive();
          } else if (event.key === "Escape") {
            closeCommand();
          }
        }}
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search size={17} className="shrink-0 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search, jump to a page, or run a command…"
            aria-label="Command palette search"
            className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-muted"
          />
          <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[0.625rem] font-semibold text-muted sm:block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[52vh] overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted">No matches for “{query}”.</p>
          ) : (
            grouped.map(([section, entries]) => (
              <div key={section} className="mb-1">
                <p className="eyebrow px-4 py-1.5">{section}</p>
                {entries.map(({ command, index }) => (
                  <button
                    key={command.id}
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={command.run}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                      index === activeIndex ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2/60",
                    )}
                  >
                    <command.icon size={15} className="shrink-0" />
                    <span className="min-w-0 flex-1 truncate">{command.label}</span>
                    {index === activeIndex ? (
                      <CornerDownLeft size={13} className="shrink-0 text-muted" aria-hidden />
                    ) : null}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-line bg-surface-2/50 px-4 py-2.5 text-[0.6875rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Plus size={11} aria-hidden /> {filtered.length} commands
          </span>
          <span>↑↓ to navigate · ↵ to run · esc to close</span>
        </div>
      </div>
    </div>
  );
}
