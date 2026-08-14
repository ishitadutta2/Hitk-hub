import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "./config";

// SERVER-ONLY. Never import this file from a "use client" component —
// the service role key bypasses Row Level Security entirely.
// Falls back to a placeholder key when unconfigured; callers (the download
// route) check isSupabaseConfigured first and never actually invoke this.
export function createAdminClient() {
  return createSupabaseClient(
    SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-key",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
