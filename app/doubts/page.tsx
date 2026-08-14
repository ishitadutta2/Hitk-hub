"use client";

import { useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { MessageCircle, Plus } from "lucide-react";

export default function DoubtsPage() {
  const { doubts, user, subjectsByDept, addDoubt, loading } = useStore();
  const subjects = subjectsByDept[user?.departmentCode ?? ""] ?? [];
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeSubject = subject || subjects[0] || "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!title || !body) return;
    setSubmitting(true);
    const result = await addDoubt(activeSubject, title, body);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    setTitle("");
    setBody("");
    setShowForm(false);
  };

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">Doubt Forum</h1>
          <p className="text-ink/60">Ask a question, help a classmate.</p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring"
        >
          <Plus size={16} /> Ask a doubt
        </button>
      </div>

      {showForm && (
        <form onSubmit={onSubmit} className="rounded-2xl border border-ink/10 bg-card p-5 mb-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Subject</label>
            <select
              value={activeSubject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm bg-white focus-ring"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Why does this recursion return 0?"
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Question</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={4}
              placeholder="Explain the doubt in detail..."
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
          </div>
          {error && <p className="text-rose text-sm">{error}</p>}
          <button
            disabled={submitting}
            className="bg-indigo text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
          >
            {submitting ? "Posting..." : "Post doubt"}
          </button>
        </form>
      )}

      <div className="space-y-3">
        {doubts.map((d) => (
          <Link
            key={d.id}
            href={`/doubts/${d.id}`}
            className="block rounded-2xl border border-ink/10 bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all focus-ring"
          >
            <p className="font-mono text-xs text-ink/50 mb-1">{d.subjectName}</p>
            <h3 className="font-display font-semibold mb-1">💡 {d.title}</h3>
            <p className="text-sm text-ink/60 mb-3">Asked by {d.authorName}</p>
            <div className="flex items-center gap-1 text-sm text-ink/50">
              <MessageCircle size={14} /> {d.answers.length} answers
            </div>
          </Link>
        ))}
        {!loading && doubts.length === 0 && <p className="text-ink/50 text-sm">No doubts yet — be the first to ask.</p>}
      </div>
    </AppShell>
  );
}
