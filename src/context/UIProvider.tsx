import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { MediaItem } from "@shared/types";

export type AuthView = "signin" | "signup" | "reset" | "magic";

interface UIContextValue {
  commandOpen: boolean;
  openCommand: () => void;
  closeCommand: () => void;
  toggleCommand: () => void;

  authOpen: boolean;
  authView: AuthView;
  openAuth: (view?: AuthView) => void;
  closeAuth: () => void;
  setAuthView: (view: AuthView) => void;

  navOpen: boolean;
  setNavOpen: (open: boolean) => void;

  saveTarget: MediaItem | null;
  openSaveDialog: (media: MediaItem) => void;
  closeSaveDialog: () => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [commandOpen, setCommandOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("signin");
  const [navOpen, setNavOpen] = useState(false);
  const [saveTarget, setSaveTarget] = useState<MediaItem | null>(null);

  const openCommand = useCallback(() => setCommandOpen(true), []);
  const closeCommand = useCallback(() => setCommandOpen(false), []);
  const toggleCommand = useCallback(() => setCommandOpen((open) => !open), []);

  const openAuth = useCallback((view: AuthView = "signin") => {
    setAuthView(view);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => setAuthOpen(false), []);

  const openSaveDialog = useCallback((media: MediaItem) => setSaveTarget(media), []);
  const closeSaveDialog = useCallback(() => setSaveTarget(null), []);

  const value = useMemo<UIContextValue>(
    () => ({
      commandOpen,
      openCommand,
      closeCommand,
      toggleCommand,
      authOpen,
      authView,
      openAuth,
      closeAuth,
      setAuthView,
      navOpen,
      setNavOpen,
      saveTarget,
      openSaveDialog,
      closeSaveDialog,
    }),
    [
      commandOpen,
      openCommand,
      closeCommand,
      toggleCommand,
      authOpen,
      authView,
      openAuth,
      closeAuth,
      navOpen,
      saveTarget,
      openSaveDialog,
      closeSaveDialog,
    ],
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error("useUI must be used inside <UIProvider>");
  return context;
}
