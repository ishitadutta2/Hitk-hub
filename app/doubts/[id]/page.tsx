"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Heart, CheckCircle2 } from "lucide-react";

export default function DoubtDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { doubts, addAnswer, user } = useStore();
  const doubt = doubts.find((d) => d.id === id);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!doubt) {
    return (
      <AppShell>
        <p className="text-ink/60">Doubt not found.</p>
      </AppShell>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer || !user) return;
    setSubmitting(true);
    const result = await addAnswer(doubt.id, answer);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    setAnswer("");
  };

  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="font-mono text-xs text-ink/50 mb-1">{doubt.subjectName}</p>
        <h1 className="font-display text-2xl font-semibold mb-2">💡 {doubt.title}</h1>
        <p className="text-sm text-ink/60 mb-1">Asked by {doubt.authorName}</p>
        <p className="text-ink/80 mb-8 mt-3">{doubt.body}</p>

        <h2 className="font-display font-semibold mb-3">{doubt.answers.length} Answers</h2>
        <div className="space-y-4 mb-8">
          {doubt.answers.map((a) => (
            <div key={a.id} className="rounded-2xl border border-ink/10 bg-card p-5 dashed-divider">
              <p className="text-sm text-ink/80 mb-3">{a.body}</p>
              <div className="flex items-center justify-between text-xs text-ink/50 pt-3">
                <span>Answered by {a.authorName}</span>
                <span className="flex items-center gap-3">
                  {a.accepted && (
                    <span className="flex items-center gap-1 text-sage font-medium">
                      <CheckCircle2 size={14} /> Accepted
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Heart size={14} /> {a.upvotes}
                  </span>
                </span>
              </div>
            </div>
          ))}
          {doubt.answers.length === 0 && (
            <p className="text-ink/50 text-sm">No answers yet — help this classmate out.</p>
          )}
        </div>

        {user ? (
          <form onSubmit={onSubmit} className="rounded-2xl border border-ink/10 bg-card p-5">
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Your answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={3}
              placeholder="Share how you'd solve this..."
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
            {error && <p className="text-rose text-sm mt-2">{error}</p>}
            <button
              disabled={submitting}
              className="mt-3 bg-indigo text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
            >
              {submitting ? "Posting..." : "Post answer"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-ink/50">Log in to answer this doubt.</p>
        )}
      </div>
    </AppShell>
  );
}
