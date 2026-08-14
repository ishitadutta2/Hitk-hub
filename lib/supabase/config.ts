// True only when real Supabase credentials are present. When false, the app
// still runs — it just skips every network call and stores nothing, so you
// can preview the UI before connecting a backend.
export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Harmless placeholders so the Supabase SDK never throws its "URL and key
// required" error just from being instantiated — we simply never call
// anything on the resulting client when isSupabaseConfigured is false.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
