import { Link } from "react-router-dom";
import { Bookmark, Cloud, CloudOff, Folder, LogIn, Sparkles, UserRound } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { MediaCard } from "@/components/media/MediaCard";
import { MasonryGrid } from "@/components/media/MasonryGrid";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Stat } from "@/components/ui/SectionHeading";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/context/AuthProvider";
import { useLibrary } from "@/context/LibraryProvider";
import { useSettings } from "@/context/SettingsProvider";
import { useUI } from "@/context/UIProvider";
import { formatDate } from "@/lib/utils";

export function ProfilePage() {
  const { user, status, isConfigured } = useAuth();
  const { stats, saved, recentlyViewed, boards, syncState } = useLibrary();
  const { preferences } = useSettings();
  const { openAuth } = useUI();

  return (
    <>
      <Seo
        title="Your profile"
        description="Your Pixora account, library stats and activity."
        path="/profile"
      />

      <header className="mb-8">
        <p className="eyebrow">Account</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Your profile
        </h1>
      </header>

      <section className="surface-card mb-8 flex flex-wrap items-center gap-5 p-6">
        <Avatar name={user?.email ?? "Pixora guest"} size={64} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-ink">{user?.email ?? "Browsing as a guest"}</h2>
          <p className="mt-1 text-sm text-muted">
            {user
              ? `Member since ${formatDate(user.created_at ?? Date.now())}`
              : "Your library is stored on this device. Sign in to sync it across browsers."}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge
              tone={syncState === "synced" ? "success" : "neutral"}
              icon={syncState === "synced" ? <Cloud size={11} /> : <CloudOff size={11} />}
            >
              {syncState === "synced"
                ? "Cloud sync active"
                : syncState === "syncing"
                  ? "Syncing…"
                  : syncState === "error"
                    ? "Sync unavailable"
                    : "Local only"}
            </Badge>
            {!isConfigured ? <Badge tone="warning">Supabase not configured</Badge> : null}
            {status === "loading" ? <Badge>Checking session…</Badge> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {user ? (
            <ButtonLink to="/settings" variant="outline">
              Manage account
            </ButtonLink>
          ) : (
            <>
              <Button variant="brand" iconLeft={<LogIn size={15} />} onClick={() => openAuth("signup")}>
                Create account
              </Button>
              <Button variant="outline" onClick={() => openAuth("signin")}>
                Sign in
              </Button>
            </>
          )}
        </div>
      </section>

      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Saved" value={stats.saved} icon={<Bookmark size={15} />} hint="Pieces in your library" />
        <Stat label="Boards" value={stats.boards} icon={<Folder size={15} />} hint="Collections you curate" />
        <Stat label="Liked" value={stats.likes} hint="Quick reactions" />
        <Stat label="Videos" value={stats.videos} hint="Clips saved" />
      </div>

      {saved.length ? (
        <section className="mb-12">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-extrabold text-ink">Recently saved</h2>
              <p className="mt-1 text-sm text-muted">The latest pieces you kept.</p>
            </div>
            <Link
              to="/saved"
              className="text-sm font-semibold text-accent underline-offset-2 hover:underline"
            >
              View all
            </Link>
          </div>
          <MasonryGrid columns={preferences.columns}>
            {saved.slice(0, 8).map((entry) => (
              <MediaCard key={entry.id} item={entry.media} density={preferences.density} />
            ))}
          </MasonryGrid>
        </section>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="surface-card p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <Sparkles size={16} aria-hidden /> Recently viewed
          </h2>
          {recentlyViewed.length === 0 ? (
            <p className="mt-3 text-sm text-muted">Open a piece and it will show up here.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {recentlyViewed.slice(0, 6).map((item) => (
                <li key={`${item.type}:${item.id}`}>
                  <Link to={`/media/${item.type}/${item.id}`} className="flex items-center gap-3 group">
                    <img
                      src={item.thumbnail}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink group-hover:underline">
                        {item.title}
                      </span>
                      <span className="block truncate text-xs text-muted">{item.creator}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="surface-card p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-ink">
            <UserRound size={16} aria-hidden /> Your workspace
          </h2>
          <dl className="mt-4 flex flex-col divide-y divide-line text-sm">
            {[
              { label: "Boards", value: String(boards.length) },
              { label: "Saved images", value: String(stats.images) },
              { label: "Saved videos", value: String(stats.videos) },
              { label: "Layout density", value: preferences.density },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-muted">{row.label}</dt>
                <dd className="font-semibold capitalize text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink to="/settings" variant="outline" size="sm" className="mt-5">
            Open settings
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
