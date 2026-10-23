import { useEffect, useRef } from "react";

type Handler = (event: KeyboardEvent) => void;

/**
 * Binds keyboard shortcuts such as `mod+k`, `shift+/` or `escape`.
 * `mod` maps to ⌘ on macOS and Ctrl elsewhere. Handlers are skipped while the
 * user types, except for combos that include a modifier key.
 */
export function useKeyboardShortcuts(shortcuts: Record<string, Handler>, enabled = true): void {
  const ref = useRef(shortcuts);
  ref.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      for (const [combo, handler] of Object.entries(ref.current)) {
        const parts = combo.toLowerCase().split("+");
        const wantsMod = parts.includes("mod");
        const wantsShift = parts.includes("shift");
        const wantsAlt = parts.includes("alt");
        const modActive = event.metaKey || event.ctrlKey;
        const mainKey = parts.filter((part) => !["mod", "shift", "alt"].includes(part)).join("+");

        if (wantsMod !== modActive) continue;
        if (wantsShift !== event.shiftKey) continue;
        if (wantsAlt !== event.altKey) continue;
        if (mainKey !== key) continue;
        if (isTyping && !wantsMod && key !== "escape") continue;

        event.preventDefault();
        handler(event);
        return;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [enabled]);
}
