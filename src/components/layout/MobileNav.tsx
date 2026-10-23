import { NavLink } from "react-router-dom";
import { MOBILE_NAV, PRIMARY_NAV, SECONDARY_NAV } from "@/data/navigation";
import { useUI } from "@/context/UIProvider";
import { Brand } from "@/components/layout/Brand";
import { ThemeToggle } from "@/components/layout/Topbar";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthProvider";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileNav() {
  return (
    <nav
      aria-label="Primary mobile"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-canvas/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
    >
      {MOBILE_NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 py-2.5 text-[0.625rem] font-semibold transition",
              isActive ? "text-ink" : "text-muted",
            )
          }
        >
          {({ isActive }) => (
            <>
              <span
                className={cn(
                  "grid h-8 w-12 place-items-center rounded-xl transition",
                  isActive && "bg-brand text-brand-ink",
                )}
              >
                <item.icon size={17} aria-hidden />
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

export function MobileDrawer() {
  const { navOpen, setNavOpen, openAuth } = useUI();
  const { user } = useAuth();

  if (!navOpen) return null;

  return (
    <div className="fixed inset-0 z-80 lg:hidden">
      <div
        role="presentation"
        className="absolute inset-0 animate-fade-in bg-ink/45 backdrop-blur-sm"
        onMouseDown={() => setNavOpen(false)}
      />
      <div className="relative flex h-full w-[min(20rem,86vw)] animate-slide-down flex-col border-r border-line bg-surface">
        <div className="flex items-center justify-between px-4 py-5">
          <Brand />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close navigation menu"
              className="grid h-9 w-9 place-items-center rounded-xl text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto px-3 pb-6">
          <p className="eyebrow px-3 pb-2">Discover</p>
          {PRIMARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                  isActive ? "bg-brand text-brand-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
                )
              }
            >
              <item.icon size={17} aria-hidden /> {item.label}
              {item.description ? <span className="sr-only">{item.description}</span> : null}
            </NavLink>
          ))}

          <p className="eyebrow mt-6 px-3 pb-2">Workspace</p>
          {SECONDARY_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setNavOpen(false)}
              className={({ isActive }) =>
                cn(
                  "mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition",
                  isActive ? "bg-surface-2 text-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
                )
              }
            >
              <item.icon size={17} aria-hidden /> {item.label}
            </NavLink>
          ))}
        </nav>

        {!user ? (
          <div className="border-t border-line p-4">
            <Button
              fullWidth
              variant="primary"
              onClick={() => {
                setNavOpen(false);
                openAuth("signin");
              }}
            >
              Sign in to sync
            </Button>
            <p className="mt-2 text-center text-xs text-muted">
              Your library stays on this device either way.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
