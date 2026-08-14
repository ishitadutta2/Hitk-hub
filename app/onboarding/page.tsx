"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { YEARS } from "@/lib/types";

export default function OnboardingPage() {
  const router = useRouter();
  const { completeOnboarding, user, departments, loading } = useStore();
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState(1);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeDept = department || departments[0]?.code || "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    const result = await completeOnboarding(activeDept, year);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center px-4">
        <p className="text-ink/50 text-sm">Loading…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-ink/10 bg-card p-8 shadow-sm">
        <h1 className="font-display text-2xl font-semibold mb-1">Complete your profile</h1>
        <p className="text-sm text-ink/60 mb-6">
          Hi {user?.name || "there"} — tell us where you study so we can tailor PYQs and notes.
        </p>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Department</label>
            <select
              value={activeDept}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring bg-white"
            >
              {departments.map((d) => (
                <option key={d.id} value={d.code}>{d.code} — {d.name}</option>
              ))}
            </select>
            {departments.length === 0 && (
              <p className="text-xs text-rose mt-1">
                No departments found yet — run supabase/seed.sql in the Supabase SQL editor.
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring bg-white"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y === 1 ? "1st" : y === 2 ? "2nd" : y === 3 ? "3rd" : "4th"} Year</option>
              ))}
            </select>
          </div>
          {error && <p className="text-rose text-sm">{error}</p>}
          <button
            disabled={submitting || departments.length === 0}
            className="w-full bg-indigo text-white rounded-full py-2.5 font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
          >
            {submitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
