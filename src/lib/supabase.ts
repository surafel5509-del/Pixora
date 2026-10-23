import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

let clientPromise: Promise<SupabaseClient<Database> | null> | null = null;
let clientInstance: SupabaseClient<Database> | null = null;

/**
 * Loads the Supabase client on demand.
 *
 * The SDK is ~100 KB gzipped and only matters for visitors who sign in, so it
 * is code-split away from the discovery experience. Everything else in Pixora
 * works with `null` here — the local library is the default, not a fallback.
 */
export function loadSupabase(): Promise<SupabaseClient<Database> | null> {
  if (!url || !anonKey) return Promise.resolve(null);
  if (clientPromise) return clientPromise;

  clientPromise = import("@supabase/supabase-js")
    .then(({ createClient }) => {
      clientInstance = createClient<Database>(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return clientInstance;
    })
    .catch((error: unknown) => {
      console.warn("[Pixora] Supabase client failed to load", error);
      clientPromise = null;
      return null;
    });

  return clientPromise;
}

/** Returns the client if it has already been loaded, otherwise null. */
export function getSupabase(): SupabaseClient<Database> | null {
  return clientInstance;
}

export class SupabaseUnavailableError extends Error {
  constructor() {
    super("Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.local.");
    this.name = "SupabaseUnavailableError";
  }
}
