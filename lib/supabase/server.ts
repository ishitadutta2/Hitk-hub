import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

// Use inside Server Components, Server Actions, and Route Handlers.
// Respects the logged-in user's session (and their RLS permissions).
// Falls back to placeholders when unconfigured — callers should check
// isSupabaseConfigured before relying on real data.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component with no writable cookies —
          // safe to ignore because middleware.ts refreshes the session.
        }
      },
    },
  });
}
