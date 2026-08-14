"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import PreviewModeBanner from "@/components/PreviewModeBanner";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const { login, user } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push(user?.onboarded ? "/dashboard" : "/onboarding");
  };

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {!isSupabaseConfigured && (
          <div className="mb-6">
            <PreviewModeBanner />
          </div>
        )}
        <Link href="/" className="flex items-center gap-2 justify-center mb-8 font-display font-semibold text-lg">
          <span className="text-2xl">🎓</span> HITK Hub
        </Link>
        <div className="rounded-2xl border border-ink/10 bg-card p-8 shadow-sm">
          <h1 className="font-display text-2xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-ink/60 mb-6">Log in with your college email.</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">College email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hitk.edu.in"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
            {error && <p className="text-rose text-sm">{error}</p>}
            <button
              disabled={submitting}
              className="w-full bg-indigo text-white rounded-full py-2.5 font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>
          </form>
          <p className="text-center text-sm text-ink/60 mt-6">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo font-medium underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
