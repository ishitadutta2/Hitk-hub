"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import StampBadge from "@/components/StampBadge";
import { Bookmark, Share2 } from "lucide-react";

export default function QuestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { questions } = useStore();
  const question = questions.find((q) => q.id === id);
  const [saved, setSaved] = useState(false);

  if (!question) {
    return (
      <AppShell>
        <p className="text-ink/60">Question not found.</p>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 mb-3">
          <StampBadge label={question.importance} color="gold" />
          <StampBadge label={question.difficulty} color="rose" />
        </div>
        <p className="font-mono text-xs text-ink/50 mb-1">{question.subjectName} • {question.unit}</p>
        <h1 className="font-display text-2xl font-semibold mb-6">{question.question}</h1>

        <div className="ticket-edge dashed-divider rounded-2xl border border-ink/10 bg-card p-6 mb-4">
          <h2 className="font-display font-semibold mb-2">Solution</h2>
          <p className="text-sm text-ink/70 leading-relaxed">{question.solution}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSaved((s) => !s)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium focus-ring ${
              saved ? "bg-sage/10 border-sage text-sage" : "border-ink/15 hover:bg-ink/5"
            }`}
          >
            <Bookmark size={16} fill={saved ? "currentColor" : "none"} /> {saved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => alert("Link copied (demo).")}
            className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-2 text-sm font-medium hover:bg-ink/5 focus-ring"
          >
            <Share2 size={16} /> Share
          </button>
        </div>
      </div>
    </AppShell>
  );
}
