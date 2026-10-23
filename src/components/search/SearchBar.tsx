import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CornerDownLeft, History, Loader2, Search, X } from "lucide-react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { fetchSuggestions } from "@/lib/media-api";
import { useLibrary } from "@/context/LibraryProvider";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  onSubmitted?: (term: string) => void;
  size?: "sm" | "md";
}

export function SearchBar({
  placeholder = "Search ideas, creators, moods…",
  className,
  inputClassName,
  autoFocus,
  defaultValue = "",
  onSubmitted,
  size = "md",
}: SearchBarProps) {
  const navigate = useNavigate();
  const { recentSearches, recordSearch } = useLibrary();
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const debounced = useDebouncedValue(value, 220);

  useEffect(() => {
    if (!open) return;
    const term = debounced.trim();
    if (term.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    void fetchSuggestions(term, controller.signal)
      .then((results) => {
        setSuggestions(results.map((entry) => entry.label));
        setActiveIndex(-1);
      })
      .catch(() => setSuggestions([]))
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [debounced, open]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  const history = useMemo(
    () =>
      recentSearches
        .filter((entry) => entry.term.toLowerCase().includes(value.trim().toLowerCase()))
        .slice(0, 5),
    [recentSearches, value],
  );

  const options = useMemo(() => {
    const combined = value.trim().length >= 2 ? suggestions : history.map((entry) => entry.term);
    return combined.slice(0, 7);
  }, [suggestions, history, value]);

  const submit = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    recordSearch(clean);
    setValue(clean);
    setOpen(false);
    inputRef.current?.blur();
    if (onSubmitted) {
      onSubmitted(clean);
      return;
    }
    void navigate(`/search?q=${encodeURIComponent(clean)}`);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(options.length - 1, index + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(-1, index - 1));
    } else if (event.key === "Enter") {
      const chosen = activeIndex >= 0 ? options[activeIndex] : value;
      submit(chosen ?? value);
    } else if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const showPanel = open && (options.length > 0 || loading);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
        className={cn(
          "flex items-center gap-2.5 rounded-2xl border border-line bg-surface px-3.5 shadow-sm transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-brand/50",
          size === "sm" ? "h-9" : "h-11",
        )}
      >
        <Search size={size === "sm" ? 15 : 17} className="shrink-0 text-muted" aria-hidden />
        <input
          ref={inputRef}
          type="search"
          value={value}
          autoFocus={autoFocus}
          onChange={(event) => {
            setValue(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label="Search Pixora"
          aria-autocomplete="list"
          aria-controls={showPanel ? listboxId : undefined}
          aria-expanded={showPanel}
          className={cn(
            "w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden",
            inputClassName,
          )}
        />
        {loading ? <Loader2 size={14} className="shrink-0 animate-spin text-muted" aria-hidden /> : null}
        {value ? (
          <button
            type="button"
            onClick={() => {
              setValue("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="shrink-0 rounded-md p-1 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <X size={14} aria-hidden />
          </button>
        ) : (
          <kbd className="hidden shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[0.625rem] font-semibold text-muted sm:block">
            ⌘K
          </kbd>
        )}
      </form>

      {showPanel ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 animate-slide-down overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          <ul
            id={listboxId}
            role="listbox"
            aria-label="Search suggestions"
            className="max-h-80 overflow-y-auto py-1.5"
          >
            {options.map((option, index) => (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === activeIndex}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => submit(option)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition",
                    index === activeIndex
                      ? "bg-surface-2 text-ink"
                      : "text-muted hover:bg-surface-2 hover:text-ink",
                  )}
                >
                  {value.trim().length < 2 ? (
                    <History size={14} className="shrink-0" aria-hidden />
                  ) : (
                    <Search size={14} className="shrink-0" aria-hidden />
                  )}
                  <span className="min-w-0 flex-1 truncate">{option}</span>
                  {index === activeIndex ? (
                    <CornerDownLeft size={13} className="shrink-0 text-muted" aria-hidden />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
