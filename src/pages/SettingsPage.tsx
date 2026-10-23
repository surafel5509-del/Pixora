import { useState } from "react";
import { Download, LayoutGrid, MoonStar, RefreshCw, ShieldCheck, Sun, Trash2 } from "lucide-react";
import { Seo } from "@/components/common/Seo";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { useSettings, type ThemeChoice } from "@/context/SettingsProvider";
import { useLibrary } from "@/context/LibraryProvider";
import { useToast } from "@/context/ToastProvider";
import { useAuth } from "@/context/AuthProvider";
import { cn, titleCase } from "@/lib/utils";
import type { Density } from "@/types";

const THEMES: { id: ThemeChoice; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: MoonStar },
  { id: "system", label: "System", icon: LayoutGrid },
];

const COLUMN_OPTIONS = [
  { value: 0, label: "Auto" },
  { value: 3, label: "3" },
  { value: 4, label: "4" },
  { value: 5, label: "5" },
  { value: 6, label: "6" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card p-6">
      <h2 className="text-base font-bold text-ink">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-5 flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function SettingsPage() {
  const { theme, setTheme, preferences, updatePreferences, resetPreferences } = useSettings();
  const { exportLibrary, resetLibrary, clearSearches, stats, syncState } = useLibrary();
  const { user, isConfigured, signOut } = useAuth();
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);

  const download = () => {
    const blob = new Blob([exportLibrary()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `pixora-library-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Export ready", "Your library JSON has been downloaded.");
  };

  return (
    <>
      <Seo
        title="Settings"
        description="Appearance, layout and data controls for your Pixora workspace."
        path="/settings"
      />

      <header className="mb-8">
        <p className="eyebrow">Preferences</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-muted">
          Everything here is stored on this device and applied instantly.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section title="Appearance" description="Choose how Pixora looks and how densely ideas are packed.">
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setTheme(option.id)}
                aria-pressed={theme === option.id}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition",
                  theme === option.id
                    ? "border-brand bg-brand/10 text-ink"
                    : "border-line bg-surface text-muted hover:text-ink",
                )}
              >
                <option.icon size={18} aria-hidden />
                {option.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(["comfortable", "compact"] as Density[]).map((density) => (
              <button
                key={density}
                type="button"
                onClick={() => updatePreferences({ density })}
                aria-pressed={preferences.density === density}
                className={cn(
                  "rounded-xl border px-4 py-3 text-xs font-semibold capitalize transition",
                  preferences.density === density
                    ? "border-brand bg-brand/10 text-ink"
                    : "border-line bg-surface text-muted hover:text-ink",
                )}
              >
                {density}
              </button>
            ))}
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Grid columns</p>
            <div className="flex flex-wrap gap-2">
              {COLUMN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreferences({ columns: option.value })}
                  aria-pressed={preferences.columns === option.value}
                  className={cn(
                    "rounded-xl border px-3.5 py-2 text-xs font-semibold transition",
                    preferences.columns === option.value
                      ? "border-brand bg-brand/10 text-ink"
                      : "border-line bg-surface text-muted hover:text-ink",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Media" description="Playback and attribution behaviour across the product.">
          <Switch
            label="Autoplay videos"
            description="Start clips muted on the detail page."
            checked={preferences.autoplayVideos}
            onChange={(value) => updatePreferences({ autoplayVideos: value })}
          />
          <Switch
            label="Show attribution"
            description="Surface creator and licence information wherever media appears."
            checked={preferences.showAttribution}
            onChange={(value) => updatePreferences({ showAttribution: value })}
          />
          <Button
            variant="outline"
            size="sm"
            iconLeft={<RefreshCw size={14} />}
            onClick={() => {
              resetPreferences();
              toast.info("Preferences reset");
            }}
          >
            Reset preferences
          </Button>
        </Section>

        <Section
          title="Account & sync"
          description="Pixora works fully offline; accounts add cross-device sync."
        >
          <div className="rounded-xl border border-line bg-surface-2/50 p-4">
            <p className="text-sm font-semibold text-ink">{user?.email ?? "Signed out"}</p>
            <p className="mt-1 text-xs text-muted">
              {isConfigured
                ? syncState === "synced"
                  ? "Your library is mirrored to Supabase."
                  : "Supabase is configured — sign in to sync."
                : "Supabase is not configured, so everything stays on this device."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={syncState === "synced" ? "success" : "neutral"}>{titleCase(syncState)}</Badge>
              <Badge tone="neutral" icon={<ShieldCheck size={11} />}>
                Row-level security
              </Badge>
            </div>
          </div>
          {user ? (
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          ) : null}
        </Section>

        <Section
          title="Your data"
          description={`${stats.saved} saved items · ${stats.boards} boards · ${stats.likes} likes on this device.`}
        >
          <Button variant="outline" iconLeft={<Download size={15} />} onClick={download}>
            Export library (JSON)
          </Button>
          <Button variant="outline" iconLeft={<Trash2 size={15} />} onClick={clearSearches}>
            Clear recent searches
          </Button>
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm font-semibold text-ink">Delete local data</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Removes every saved item, board, like and recent search from this device. Preferences are kept
              and cloud copies are untouched.
            </p>
            {confirming ? (
              <div className="mt-3 flex gap-2">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    resetLibrary();
                    setConfirming(false);
                  }}
                >
                  Yes, delete everything
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 text-danger"
                onClick={() => setConfirming(true)}
              >
                Delete local data…
              </Button>
            )}
          </div>
        </Section>
      </div>
    </>
  );
}
