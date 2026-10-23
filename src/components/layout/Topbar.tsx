import { Link, NavLink } from "react-router-dom";
import { Command, Menu, MoonStar, Plus, Search, Sun } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { SearchBar } from "@/components/search/SearchBar";
import { Button, ButtonLink, IconButton } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useUI } from "@/context/UIProvider";
import { initials } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useSettings();
  return (
    <IconButton
      label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      variant="outline"
      className={className}
      onClick={toggleTheme}
    >
      {resolvedTheme === "dark" ? <Sun size={16} aria-hidden /> : <MoonStar size={16} aria-hidden />}
    </IconButton>
  );
}

export function Topbar() {
  const { openCommand, setNavOpen, openAuth } = useUI();
  const { user, status } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          aria-label="Open navigation menu"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line text-muted transition hover:text-ink lg:hidden"
        >
          <Menu size={18} aria-hidden />
        </button>

        <Brand className="lg:hidden" />

        <div className="mx-auto hidden w-full max-w-xl lg:block">
          <SearchBar size="sm" />
        </div>

        <div className="ml-auto flex items-center gap-2">
          <IconButton
            label="Open command palette"
            variant="outline"
            className="lg:hidden"
            onClick={openCommand}
          >
            <Search size={16} aria-hidden />
          </IconButton>

          <IconButton
            label="Open command palette"
            variant="outline"
            className="hidden lg:grid"
            onClick={openCommand}
          >
            <Command size={15} aria-hidden />
          </IconButton>

          <ThemeToggle />

          <ButtonLink
            to="/contribute"
            variant="brand"
            size="sm"
            iconLeft={<Plus size={15} aria-hidden />}
            className="hidden sm:inline-flex"
          >
            Contribute
          </ButtonLink>

          {status === "authenticated" && user ? (
            <NavLink
              to="/profile"
              aria-label="Your profile"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[0.6875rem] font-bold text-brand-ink transition hover:brightness-105"
            >
              {initials(user.email ?? "P")}
            </NavLink>
          ) : (
            <Button variant="primary" size="sm" className="shrink-0" onClick={() => openAuth("signin")}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-line px-4 py-2.5 lg:hidden">
        <Link
          to="/search"
          className="flex items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 py-2 text-sm text-muted"
        >
          <Search size={15} aria-hidden />
          <span>Search Pixora</span>
        </Link>
      </div>
    </header>
  );
}
