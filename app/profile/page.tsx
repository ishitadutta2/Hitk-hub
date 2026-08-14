"use client";

import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";

export default function ProfilePage() {
  const { user, doubts, purchases, notes } = useStore();
  const doubtsAsked = doubts.filter((d) => d.userId === user?.id).length;
  const answersGiven = doubts.reduce(
    (sum, d) => sum + d.answers.filter((a) => a.userId === user?.id).length,
    0
  );
  const notesUploaded = notes.filter((n) => n.sellerId === user?.id).length;
  const verifiedPurchases = purchases.filter((p) => p.paymentStatus === "verified").length;

  return (
    <AppShell>
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-8">
          <span className="h-16 w-16 rounded-full bg-indigo text-white grid place-items-center text-2xl font-semibold">
            {user?.name?.[0]?.toUpperCase() ?? "?"}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold">{user?.name ?? "Guest"}</h1>
            <p className="text-ink/60 text-sm">{user?.email}</p>
            <p className="font-mono text-xs text-ink/50 mt-1">
              {user?.departmentCode ?? "—"} • Year {user?.year ?? "—"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Stat label="XP" value={String(user?.xp ?? 0)} />
          <Stat label="Doubts asked" value={String(doubtsAsked)} />
          <Stat label="Answers given" value={String(answersGiven)} />
          <Stat label="Notes uploaded" value={String(notesUploaded)} />
          <Stat label="Notes purchased" value={String(verifiedPurchases)} />
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-card p-4">
      <p className="text-xs text-ink/50 uppercase tracking-wide mb-1">{label}</p>
      <p className="font-display text-2xl font-semibold">{value}</p>
    </div>
  );
}
