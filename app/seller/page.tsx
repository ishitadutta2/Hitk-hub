"use client";

import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { PLATFORM_FEE_PERCENT } from "@/lib/types";
import Link from "next/link";

export default function SellerDashboardPage() {
  const { user, notes } = useStore();
  const mine = notes.filter((n) => n.sellerId === user?.id);
  const totalSales = mine.reduce((sum, n) => sum + n.salesCount, 0);
  const grossRevenue = mine.reduce((sum, n) => sum + n.salesCount * n.price, 0);
  const netRevenue = Math.round(grossRevenue * (1 - PLATFORM_FEE_PERCENT / 100));
  const avgRating = mine.length
    ? (mine.reduce((s, n) => s + n.rating, 0) / mine.length).toFixed(1)
    : "—";

  return (
    <AppShell>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl font-semibold">Seller Dashboard</h1>
        <Link
          href="/notes/upload"
          className="bg-indigo text-white rounded-full px-4 py-2 text-sm font-medium hover:bg-indigo-dark transition-colors focus-ring"
        >
          Upload new notes
        </Link>
      </div>

      <div className="grid sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Net earnings" value={`₹${netRevenue}`} />
        <Stat label="Notes sold" value={String(totalSales)} />
        <Stat label="Active notes" value={String(mine.length)} />
        <Stat label="Avg. rating" value={avgRating} />
      </div>

      <h2 className="font-display font-semibold mb-3">My Notes</h2>
      <div className="space-y-3">
        {mine.map((n) => (
          <div key={n.id} className="rounded-2xl border border-ink/10 bg-card p-5 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-display font-semibold">{n.title}</p>
              <p className="text-xs text-ink/50 font-mono">₹{n.price} • {n.salesCount} sales</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => alert("Demo: edit form would open here.")}
                className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:bg-ink/5 focus-ring"
              >
                Edit
              </button>
              <button
                onClick={() => alert("Demo: analytics view would open here.")}
                className="rounded-full border border-ink/15 px-4 py-1.5 text-sm hover:bg-ink/5 focus-ring"
              >
                Analytics
              </button>
            </div>
          </div>
        ))}
        {mine.length === 0 && (
          <p className="text-ink/50 text-sm">You haven&apos;t listed any notes yet.</p>
        )}
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
