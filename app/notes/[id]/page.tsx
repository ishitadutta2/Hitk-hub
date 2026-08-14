"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import Stars from "@/components/Stars";
import { useStore } from "@/lib/store";
import { CreditCard, Download, ShieldCheck, Clock } from "lucide-react";

export default function NoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notes, buyNote, hasPurchased, purchaseStatus, user } = useStore();
  const note = notes.find((n) => n.id === id);
  const [reference, setReference] = useState("");
  const [showPayForm, setShowPayForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  if (!note) {
    return (
      <AppShell>
        <p className="text-ink/60">Note not found.</p>
      </AppShell>
    );
  }

  const owned = hasPurchased(note.id);
  const status = purchaseStatus(note.id);
  const isOwnNote = note.sellerId === user?.id;

  const onSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!reference.trim()) {
      setError("Enter the UPI transaction reference / UTR number.");
      return;
    }
    setSubmitting(true);
    const result = await buyNote(note.id, reference.trim());
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError("");
    setShowPayForm(false);
  };

  const onDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/notes/${note.id}/download`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Could not download this note.");
        return;
      }
      window.open(data.url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <AppShell>
      <div className="max-w-2xl">
        <p className="font-mono text-xs text-ink/50 mb-1">{note.subjectName}</p>
        <h1 className="font-display text-2xl font-semibold mb-2">{note.title}</h1>
        <div className="flex items-center gap-4 mb-6">
          <Stars rating={note.rating} count={note.reviewCount} />
          <span className="text-sm text-ink/50">{note.salesCount} sold</span>
        </div>

        <div className="ticket-edge dashed-divider rounded-2xl border border-ink/10 bg-card p-6 mb-6">
          <p className="text-sm text-ink/70 mb-4">{note.description}</p>
          <p className="text-xs text-ink/50 font-mono mb-1">
            {note.pages} pages · {note.previewPages} free preview pages
          </p>
          <p className="text-xs text-ink/50">Sold by {note.sellerName}</p>
        </div>

        <div className="rounded-2xl border border-ink/10 bg-card p-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
            <div>
              <p className="text-sm text-ink/60 mb-1">Price</p>
              <p className="font-display text-3xl font-semibold">₹{note.price}</p>
            </div>

            {isOwnNote ? (
              <span className="text-sm text-ink/50">This is your listing.</span>
            ) : owned ? (
              <button
                onClick={onDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 bg-sage text-white rounded-full px-6 py-3 font-medium hover:opacity-90 transition-opacity focus-ring disabled:opacity-60"
              >
                <Download size={18} /> {downloading ? "Preparing link..." : "Download PDF"}
              </button>
            ) : status === "pending_verification" ? (
              <span className="inline-flex items-center gap-2 text-gold font-medium">
                <Clock size={18} /> Payment submitted — awaiting verification
              </span>
            ) : (
              <button
                onClick={() => (user ? setShowPayForm((s) => !s) : router.push("/login"))}
                className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-6 py-3 font-medium hover:bg-indigo-dark transition-colors focus-ring"
              >
                <CreditCard size={18} /> Buy now
              </button>
            )}
          </div>

          {showPayForm && !owned && status !== "pending_verification" && (
            <form onSubmit={onSubmitPayment} className="dashed-divider pt-4 mt-2 space-y-3">
              <p className="text-sm text-ink/70">
                Pay <strong>₹{note.price}</strong> to the seller&apos;s UPI ID, then paste the transaction
                reference (UTR) below. An admin verifies it before the note unlocks.
              </p>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="UPI transaction reference / UTR"
                className="w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
              {error && <p className="text-rose text-sm">{error}</p>}
              <button
                disabled={submitting}
                className="inline-flex items-center gap-2 bg-indigo text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
              >
                <ShieldCheck size={16} /> {submitting ? "Submitting..." : "Submit for verification"}
              </button>
            </form>
          )}
        </div>
        <p className="text-xs text-ink/40 mt-3">
          Manual UPI verification for now — swap this for a Razorpay checkout + webhook when you're
          ready to automate it (see README).
        </p>
      </div>
    </AppShell>
  );
}
