"use client";

import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Client Components (anything with "use client") use this. It reads the
// public URL + anon key, and RLS policies in supabase/schema.sql are what
// actually keep data safe — the anon key alone grants nothing.
// Falls back to harmless placeholders when unconfigured; lib/store.tsx
// checks isSupabaseConfigured before ever calling anything on this client.
export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
