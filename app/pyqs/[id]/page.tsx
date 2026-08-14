"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Download } from "lucide-react";

export default function PyqDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { pyqs, questions } = useStore();
  const pyq = pyqs.find((p) => p.id === id);
  const related = questions.filter((q) => q.subjectName === pyq?.subjectName);

  if (!pyq) {
    return (
      <AppShell>
        <p className="text-ink/60">PYQ not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <h1 className="font-display text-2xl font-semibold mb-1">{pyq.subjectName}</h1>
        <p className="text-ink/60 mb-6">{pyq.examType} · {pyq.examYear}</p>

        <div className="ticket-edge dashed-divider rounded-2xl border border-ink/10 bg-card p-6 mb-8">
          <p className="text-sm text-ink/70 mb-4">
            This is the scanned question paper for {pyq.subjectName} ({pyq.examType}, {pyq.examYear}).
          </p>
          <button
            onClick={() => alert("Wire this up to a signed Storage URL once PYQ files are uploaded.")}
            className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>

        {related.length > 0 && (
          <>
            <h2 className="font-display font-semibold mb-3">Related important questions</h2>
            <div className="space-y-2">
              {related.map((q) => (
                <Link
                  key={q.id}
                  href={`/questions/${q.id}`}
                  className="block rounded-xl border border-ink/10 bg-card px-4 py-3 text-sm hover:bg-ink/5 focus-ring"
                >
                  {q.question}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
