"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import PreviewModeBanner from "@/components/PreviewModeBanner";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await signup(name, email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setNeedsConfirmation(true);
      return;
    }
    router.push("/onboarding");
  };

  if (needsConfirmation) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-card p-8 shadow-sm text-center">
          <h1 className="font-display text-2xl font-semibold mb-2">Check your email</h1>
          <p className="text-sm text-ink/60">
            We sent a confirmation link to <strong>{email}</strong>. Click it, then come back and log in.
          </p>
          <Link href="/login" className="inline-block mt-6 text-indigo font-medium underline underline-offset-4">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

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
          <h1 className="font-display text-2xl font-semibold mb-1">Create your account</h1>
          <p className="text-sm text-ink/60 mb-6">Join the class. Takes less than a minute.</p>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Full name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ishita Dutta"
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
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
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Confirm password</label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
            {error && <p className="text-rose text-sm">{error}</p>}
            <button
              disabled={submitting}
              className="w-full bg-indigo text-white rounded-full py-2.5 font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
            >
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>
          <p className="text-center text-sm text-ink/60 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo font-medium underline underline-offset-4">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
