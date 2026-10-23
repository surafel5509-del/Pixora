import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, LogIn, MoonStar, PanelLeftClose, Sun } from "lucide-react";
import type { Compass } from "lucide-react";
import { Brand } from "@/components/layout/Brand";
import { useAuth } from "@/context/AuthProvider";
import { useLibrary } from "@/context/LibraryProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useUI } from "@/context/UIProvider";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { CATEGORIES } from "@shared/taxonomy";
import { PRIMARY_NAV, SECONDARY_NAV } from "@/data/navigation";
import { cn } from "@/lib/utils";

function NavRow({
  to,
  icon: Icon,
  label,
  description,
  collapsed,
  end,
  badge,
}: {
  to: string;
  icon: typeof Compass;
  label: string;
  description?: string;
  collapsed: boolean;
  end?: boolean;
  badge?: string | number;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold transition",
          collapsed && "justify-center px-0",
          isActive ? "bg-brand text-brand-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
        )
      }
    >
      <Icon size={17} className="shrink-0" aria-hidden />
      {!collapsed ? (
        <>
          <span className="min-w-0 flex-1 truncate">{label}</span>
          {badge !== undefined ? (
            <span
              className={cn(
                "rounded-md bg-ink/5 px-1.5 py-0.5 text-[0.625rem] font-bold tabular-nums group-hover:bg-black/5",
              )}
            >
              {badge}
            </span>
          ) : null}
        </>
      ) : null}
      {!collapsed && description ? <span className="sr-only">{description}</span> : null}
    </NavLink>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useLocalStorage("sidebar-collapsed", false);
  const { boards, stats } = useLibrary();
  const { user } = useAuth();
  const { resolvedTheme, toggleTheme } = useSettings();
  const { openAuth } = useUI();
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-dvh shrink-0 flex-col border-r border-line bg-surface lg:flex",
        collapsed ? "w-[76px]" : "w-[264px]",
        "transition-[width] duration-200",
      )}
    >
      <div className={cn("flex items-center gap-2 px-4 py-5", collapsed && "justify-center px-2")}>
        <Brand collapsed={collapsed} />
        {!collapsed ? (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            aria-label="Collapse sidebar"
            className="ml-auto rounded-lg p-1.5 text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <PanelLeftClose size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            aria-label="Expand sidebar"
            className="absolute left-1/2 top-[68px] -translate-x-1/2 rounded-lg border border-line bg-surface p-1 text-muted shadow-sm transition hover:text-ink"
          >
            <ChevronRight size={13} />
          </button>
        )}
      </div>

      <nav aria-label="Primary" className={cn("flex flex-col gap-1 px-3", collapsed && "px-2")}>
        {PRIMARY_NAV.map((item) => (
          <NavRow
            key={item.to}
            {...item}
            collapsed={collapsed}
            end={item.to === "/"}
            badge={item.to === "/saved" ? stats.saved || undefined : undefined}
          />
        ))}
      </nav>

      <div className={cn("mt-6 px-3", collapsed && "px-2")}>
        {!collapsed ? <p className="eyebrow mb-2 px-3">Categories</p> : null}
        <div className="flex flex-col gap-0.5">
          {CATEGORIES.slice(1, 6).map((category) => {
            const to = `/explore?category=${category.slug}`;
            const isActive =
              location.search.includes(`category=${category.slug}`) && location.pathname === "/explore";
            return (
              <NavLink
                key={category.slug}
                to={to}
                title={collapsed ? category.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[0.8125rem] transition",
                  collapsed && "justify-center px-0",
                  isActive
                    ? "bg-surface-2 font-semibold text-ink"
                    : "text-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <span aria-hidden className="text-sm">
                  {category.emoji}
                </span>
                {!collapsed ? <span className="truncate">{category.label}</span> : null}
              </NavLink>
            );
          })}
        </div>
      </div>

      {!collapsed && boards.length ? (
        <div className="mt-6 min-h-0 flex-1 overflow-y-auto px-3">
          <p className="eyebrow mb-2 px-3">Your boards</p>
          <div className="flex flex-col gap-0.5">
            {boards.slice(0, 6).map((board) => (
              <NavLink
                key={board.id}
                to={`/boards/${board.id}`}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[0.8125rem] text-muted transition hover:bg-surface-2 hover:text-ink"
              >
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: `hsl(${board.accent.length * 47 + 60} 62% 52%)` }}
                />
                <span className="truncate">{board.name}</span>
              </NavLink>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1" />
      )}

      <div className={cn("mt-auto flex flex-col gap-1 border-t border-line px-3 py-4", collapsed && "px-2")}>
        {SECONDARY_NAV.slice(0, collapsed ? 2 : 4).map((item) => (
          <NavRow key={item.to} {...item} collapsed={collapsed} />
        ))}

        <button
          type="button"
          onClick={toggleTheme}
          title={collapsed ? "Toggle theme" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.8125rem] font-semibold text-muted transition hover:bg-surface-2 hover:text-ink",
            collapsed && "justify-center px-0",
          )}
        >
          {resolvedTheme === "dark" ? (
            <Sun size={17} className="shrink-0" aria-hidden />
          ) : (
            <MoonStar size={17} className="shrink-0" aria-hidden />
          )}
          {!collapsed ? <span>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</span> : null}
        </button>

        {!collapsed ? (
          user ? (
            <NavLink
              to="/profile"
              className="mt-2 flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand text-[0.6875rem] font-bold text-brand-ink">
                {(user.email ?? "P").slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.8125rem] font-semibold text-ink">{user.email}</span>
                <span className="block text-[0.6875rem] text-muted">{stats.saved} saved</span>
              </span>
              <ChevronLeft size={15} className="rotate-180 text-muted" aria-hidden />
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={() => openAuth("signin")}
              className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-ink px-3 py-2.5 text-[0.8125rem] font-semibold text-canvas transition hover:bg-ink/90"
            >
              <LogIn size={15} aria-hidden /> Sign in
            </button>
          )
        ) : null}
      </div>
    </aside>
  );
}
