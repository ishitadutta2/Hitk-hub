"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppShell from "@/components/AppShell";
import NoteCard from "@/components/NoteCard";
import { useStore } from "@/lib/store";
import { Plus } from "lucide-react";

function NotesInner() {
  const { notes, user, loading } = useStore();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  const visible = useMemo(
    () => notes.filter((n) => n.status === "approved" || n.sellerId === user?.id),
    [notes, user]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.subjectName.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q)
    );
  }, [visible, query]);

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">Notes Marketplace</h1>
          <p className="text-ink/60">Handwritten notes, priced by the students who wrote them.</p>
        </div>
        <Link
          href="/notes/upload"
          className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring"
        >
          <Plus size={16} /> Sell your notes
        </Link>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes..."
        className="w-full max-w-md mb-6 rounded-full border border-ink/15 bg-white px-4 py-2 text-sm focus-ring"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((note) => (
          <div key={note.id} className="relative">
            {note.status !== "approved" && note.sellerId === user?.id && (
              <span className="absolute -top-2 -right-2 z-10 rounded-full bg-gold text-white text-[10px] font-mono font-bold uppercase px-2 py-1">
                {note.status === "pending" ? "Pending review" : "Rejected"}
              </span>
            )}
            <NoteCard note={note} />
          </div>
        ))}
        {!loading && filtered.length === 0 && <p className="text-ink/50 text-sm">No notes match your search.</p>}
      </div>
    </AppShell>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesInner />
    </Suspense>
  );
}
