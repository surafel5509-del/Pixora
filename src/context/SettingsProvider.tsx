import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { STORAGE_KEYS, readJson, readString, writeJson, writeString } from "@/lib/storage";
import { DEFAULT_PREFERENCES, type Density, type Preferences } from "@/types";

export type ThemeChoice = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface SettingsContextValue {
  theme: ThemeChoice;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeChoice) => void;
  toggleTheme: () => void;
  preferences: Preferences;
  updatePreferences: (patch: Partial<Preferences>) => void;
  setDensity: (density: Density) => void;
  resetPreferences: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function systemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>(() => {
    const stored = readString(STORAGE_KEYS.theme, "system");
    return stored === "light" || stored === "dark" ? stored : "system";
  });

  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(systemTheme);
  const [preferences, setPreferences] = useState<Preferences>(() =>
    readJson<Preferences>(STORAGE_KEYS.preferences, { ...DEFAULT_PREFERENCES }),
  );

  const resolvedTheme: ResolvedTheme = theme === "system" ? systemPreference : theme;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => setSystemPreference(event.matches ? "dark" : "light");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    root.dataset.theme = resolvedTheme;
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute("content", resolvedTheme === "dark" ? "#0b0c0a" : "#fbfaf7");
  }, [resolvedTheme]);

  useEffect(() => {
    writeJson(STORAGE_KEYS.preferences, preferences);
  }, [preferences]);

  const setTheme = useCallback((next: ThemeChoice) => {
    setThemeState(next);
    writeString(STORAGE_KEYS.theme, next);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((current) => {
      const currentResolved = current === "system" ? systemTheme() : current;
      const next: ThemeChoice = currentResolved === "dark" ? "light" : "dark";
      writeString(STORAGE_KEYS.theme, next);
      return next;
    });
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences((current) => ({ ...current, ...patch }));
  }, []);

  const setDensity = useCallback((density: Density) => updatePreferences({ density }), [updatePreferences]);

  const resetPreferences = useCallback(() => setPreferences({ ...DEFAULT_PREFERENCES }), []);

  const value = useMemo<SettingsContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      preferences,
      updatePreferences,
      setDensity,
      resetPreferences,
    }),
    [
      theme,
      resolvedTheme,
      setTheme,
      toggleTheme,
      preferences,
      updatePreferences,
      setDensity,
      resetPreferences,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("useSettings must be used inside <SettingsProvider>");
  return context;
}
