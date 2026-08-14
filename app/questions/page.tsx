"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import StampBadge from "@/components/StampBadge";

const IMPORTANCE_COLOR: Record<string, "gold" | "sage" | "indigo"> = {
  Important: "gold",
  Frequent: "sage",
  "Must Study": "indigo",
};

export default function QuestionsPage() {
  const { user, subjectsByDept, questions, loading } = useStore();
  const subjects = subjectsByDept[user?.departmentCode ?? ""] ?? [];
  const [subject, setSubject] = useState<string>("all");

  const items = useMemo(
    () => questions.filter((q) => (subject === "all" ? true : q.subjectName === subject)),
    [questions, subject]
  );

  const byUnit = useMemo(() => {
    const map = new Map<string, typeof questions>();
    items.forEach((q) => map.set(q.unit, [...(map.get(q.unit) ?? []), q]));
    return map;
  }, [items]);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-1">Suggested & Important Questions</h1>
      <p className="text-ink/60 mb-6">Curated by unit, ranked by how likely they are to appear.</p>

      <select
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        className="mb-6 rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus-ring"
      >
        <option value="all">All subjects</option>
        {subjects.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <div className="space-y-6">
        {Array.from(byUnit.entries()).map(([unit, qs]) => (
          <div key={unit}>
            <h2 className="font-display font-semibold mb-3">{unit}</h2>
            <div className="space-y-3">
              {qs.map((q, i) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="block rounded-2xl border border-ink/10 bg-card p-4 hover:shadow-md hover:-translate-y-0.5 transition-all focus-ring"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm">
                      <span className="text-ink/40 font-mono mr-2">{i + 1}.</span>
                      {q.question}
                    </p>
                    <StampBadge label={q.importance} color={IMPORTANCE_COLOR[q.importance]} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-ink/50 text-sm">No questions for this subject yet.</p>
        )}
      </div>
    </AppShell>
  );
}
