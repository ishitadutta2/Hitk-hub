"use client";

import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";

export default function LeaderboardPage() {
  const { leaderboard, user, loading } = useStore();

  return (
    <AppShell>
      <h1 className="font-display text-2xl font-semibold mb-1">🏆 HITK Contributors</h1>
      <p className="text-ink/60 mb-6">Earned by asking, answering, and sharing notes.</p>

      <div className="rounded-2xl border border-ink/10 bg-card overflow-hidden">
        {leaderboard.map((entry, i) => (
          <div
            key={`${entry.name}-${i}`}
            className={`flex items-center justify-between px-5 py-4 ${i !== leaderboard.length - 1 ? "dashed-divider" : ""} ${
              entry.name === user?.name ? "bg-indigo/5" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <span className="font-display font-semibold w-6 text-center text-ink/50">{i + 1}</span>
              <div>
                <p className="font-medium">{entry.name}{entry.name === user?.name ? " (you)" : ""}</p>
                <p className="text-xs text-ink/50">{entry.tag}</p>
              </div>
            </div>
            <span className="font-display font-semibold text-gold">{entry.xp} XP</span>
          </div>
        ))}
        {!loading && leaderboard.length === 0 && (
          <p className="text-ink/50 text-sm p-5">No contributors yet — be the first.</p>
        )}
      </div>
    </AppShell>
  );
}
