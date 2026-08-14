"use client";

import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { Download, Clock, XCircle } from "lucide-react";

export default function PurchasesPage() {
  const { purchases, notes } = useStore();

  const owned = purchases
    .map((p) => ({ purchase: p, note: notes.find((n) => n.id === p.noteId) }))
    .filter((x) => x.note);

  const onDownload = async (noteId: string) => {
    const res = await fetch(`/api/notes/${noteId}/download`);
    const data = await res.json();
    if (!res.ok) {
      alert(data.error ?? "Could not download this note.");
      return;
    }
    window.open(data.url, "_blank");
  };

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-1">My Purchases</h1>
      <p className="text-ink/60 mb-6">Notes you&apos;ve bought — some may still be awaiting payment verification.</p>

      <div className="space-y-3">
        {owned.map(({ purchase, note }) => (
          <div key={purchase.id} className="ticket-edge dashed-divider rounded-2xl border border-ink/10 bg-card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-display font-semibold">{note!.title}</p>
              <p className="text-xs text-ink/50 font-mono">
                {note!.subjectName} • ₹{purchase.amount}
              </p>
            </div>
            {purchase.paymentStatus === "verified" && (
              <button
                onClick={() => onDownload(note!.id)}
                className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring"
              >
                <Download size={16} /> Open notes
              </button>
            )}
            {purchase.paymentStatus === "pending_verification" && (
              <span className="inline-flex items-center gap-2 text-gold text-sm font-medium">
                <Clock size={16} /> Awaiting verification
              </span>
            )}
            {purchase.paymentStatus === "rejected" && (
              <span className="inline-flex items-center gap-2 text-rose text-sm font-medium">
                <XCircle size={16} /> Payment rejected
              </span>
            )}
          </div>
        ))}
        {owned.length === 0 && (
          <p className="text-ink/50 text-sm">You haven&apos;t bought any notes yet — browse the marketplace.</p>
        )}
      </div>
    </AppShell>
  );
}
