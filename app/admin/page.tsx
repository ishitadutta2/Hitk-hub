"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";

const TABS = ["Notes", "Payments", "Doubts", "Reports"] as const;

export default function AdminPage() {
  const {
    user,
    isAdmin,
    notes,
    doubts,
    reports,
    pendingPayments,
    fetchReports,
    fetchPendingPayments,
    setNoteStatus,
    verifyPurchase,
    resolveReport,
  } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Notes");

  useEffect(() => {
    if (isAdmin) {
      fetchReports();
      fetchPendingPayments();
    }
  }, [isAdmin, fetchReports, fetchPendingPayments]);

  if (!isAdmin) {
    return (
      <AppShell>
        <p className="text-ink/60">
          {user ? "You don't have admin access." : "Log in as an admin to view this page."}
        </p>
        <p className="text-xs text-ink/40 mt-2">
          Promote yourself with: <code>update profiles set role = &apos;admin&apos; where email = &apos;you@hitk.edu.in&apos;;</code>
        </p>
      </AppShell>
    );
  }

  const pendingNotes = notes.filter((n) => n.status === "pending");
  const pendingReports = reports.filter((r) => r.status === "pending");

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-1">Admin Dashboard</h1>
      <p className="text-ink/60 mb-6">Signed in as an {user?.role}.</p>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Notes total" value={String(notes.length)} />
        <Stat label="Pending notes" value={String(pendingNotes.length)} />
        <Stat label="Pending payments" value={String(pendingPayments.length)} />
        <Stat label="Open reports" value={String(pendingReports.length)} />
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-2 text-sm font-medium focus-ring ${
              tab === t ? "bg-ink text-paper" : "border border-ink/15 hover:bg-ink/5"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Notes" && (
        <div className="space-y-3">
          {notes.map((n) => (
            <div key={n.id} className="rounded-2xl border border-ink/10 bg-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-display font-semibold">{n.title}</p>
                <p className="text-xs text-ink/50 font-mono">
                  by {n.sellerName} • ₹{n.price} • status: {n.status}
                </p>
              </div>
              {n.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setNoteStatus(n.id, "approved")}
                    className="rounded-full border border-sage text-sage px-4 py-1.5 text-sm hover:bg-sage/10 focus-ring"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setNoteStatus(n.id, "rejected")}
                    className="rounded-full border border-rose text-rose px-4 py-1.5 text-sm hover:bg-rose/10 focus-ring"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
          {notes.length === 0 && <p className="text-ink/50 text-sm">No notes yet.</p>}
        </div>
      )}

      {tab === "Payments" && (
        <div className="space-y-3">
          {pendingPayments.map((p) => (
            <div key={p.id} className="rounded-2xl border border-gold/40 bg-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-display font-semibold">{p.noteTitle}</p>
                <p className="text-xs text-ink/50 font-mono">
                  ₹{p.amount} • from {p.buyerName} • UTR: {p.paymentReference}
                </p>
              </div>
              <button
                onClick={() => verifyPurchase(p.id, p.noteId)}
                className="rounded-full border border-sage text-sage px-4 py-1.5 text-sm hover:bg-sage/10 focus-ring"
              >
                Mark verified
              </button>
            </div>
          ))}
          {pendingPayments.length === 0 && <p className="text-ink/50 text-sm">No payments awaiting verification.</p>}
        </div>
      )}

      {tab === "Doubts" && (
        <div className="space-y-3">
          {doubts.map((d) => (
            <div key={d.id} className="rounded-2xl border border-ink/10 bg-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-display font-semibold">{d.title}</p>
                <p className="text-xs text-ink/50 font-mono">by {d.authorName} • {d.answers.length} answers</p>
              </div>
            </div>
          ))}
          {doubts.length === 0 && <p className="text-ink/50 text-sm">No doubts yet.</p>}
        </div>
      )}

      {tab === "Reports" && (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="rounded-2xl border border-rose/30 bg-card p-5 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-display font-semibold">🚨 {r.contentType} · {r.reason}</p>
                <p className="text-sm text-ink/60">Reported by {r.reporterName} • status: {r.status}</p>
              </div>
              {r.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => resolveReport(r.id, "resolved")}
                    className="rounded-full border border-sage text-sage px-4 py-1.5 text-sm hover:bg-sage/10 focus-ring"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => resolveReport(r.id, "dismissed")}
                    className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:bg-ink/5 focus-ring"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          ))}
          {reports.length === 0 && (
            <p className="text-ink/50 text-sm">
              No reports yet — there's no "report" button wired up in the UI yet; insert test rows into
              the `reports` table to try this out, or build that button next.
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-card p-4">
      <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-xl font-semibold">{value}</p>
    </div>
  );
}
