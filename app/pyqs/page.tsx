"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Download } from "lucide-react";

export default function PyqsPage() {
  const { user, subjectsByDept, pyqs, loading } = useStore();
  const subjects = subjectsByDept[user?.departmentCode ?? ""] ?? [];
  const [subject, setSubject] = useState<string>("all");
  const [examType, setExamType] = useState<string>("all");

  const filtered = useMemo(
    () =>
      pyqs
        .filter((p) => (subject === "all" ? true : p.subjectName === subject))
        .filter((p) => (examType === "all" ? true : p.examType === examType)),
    [pyqs, subject, examType]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, typeof pyqs>();
    filtered.forEach((p) => {
      const key = `${p.subjectName}__${p.examYear}`;
      map.set(key, [...(map.get(key) ?? []), p]);
    });
    return map;
  }, [filtered]);

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-1">Previous Year Questions</h1>
      <p className="text-ink/60 mb-6">
        Filter by subject and exam type to find exactly what you need.
      </p>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus-ring"
        >
          <option value="all">All subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          className="rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm focus-ring"
        >
          <option value="all">All exam types</option>
          <option value="Mid Sem">Mid Sem</option>
          <option value="End Sem">End Sem</option>
        </select>
      </div>

      <div className="space-y-6">
        {Array.from(grouped.entries()).map(([key, items]) => {
          const [subj, ayear] = key.split("__");
          return (
            <div key={key} className="rounded-2xl border border-ink/10 bg-card p-5">
              <h3 className="font-display font-semibold mb-1">{subj}</h3>
              <p className="font-mono text-xs text-ink/50 mb-3">{ayear}</p>
              <div className="flex flex-wrap gap-3">
                {items.map((p) => (
                  <Link
                    key={p.id}
                    href={`/pyqs/${p.id}`}
                    className="flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm hover:bg-ink/5 focus-ring"
                  >
                    {p.examType} <Download size={14} className="text-indigo" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        {!loading && grouped.size === 0 && (
          <p className="text-ink/50 text-sm">
            No PYQs match those filters yet — approved PYQs uploaded by students will show up here.
          </p>
        )}
      </div>
    </AppShell>
  );
}
