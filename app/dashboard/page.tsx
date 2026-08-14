"use client";

import Link from "next/link";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { BookOpen, FileQuestion, MessageCircleQuestion, ShoppingBag, GraduationCap, Users } from "lucide-react";

const TILES = [
  { href: "/pyqs", label: "PYQs", icon: BookOpen, desc: "Previous year questions" },
  { href: "/questions", label: "Questions", icon: FileQuestion, desc: "Suggested & important" },
  { href: "/doubts", label: "Doubts", icon: MessageCircleQuestion, desc: "Ask & answer" },
  { href: "/notes", label: "Marketplace", icon: ShoppingBag, desc: "Buy & sell notes" },
  { href: "/seller", label: "Seller Dashboard", icon: GraduationCap, desc: "Track your sales" },
  { href: "/leaderboard", label: "Leaderboard", icon: Users, desc: "Top contributors" },
];

export default function DashboardPage() {
  const { user } = useStore();

  return (
    <AppShell>
      <div className="max-w-4xl">
        <p className="font-mono text-xs text-ink/50 mb-1">
          {user?.departmentCode ?? "—"} • Year {user?.year ?? "—"}
        </p>
        <h1 className="font-display text-3xl font-semibold mb-1">
          Hello, {user?.name || "Student"} 👋
        </h1>
        <p className="text-ink/60 mb-8">What do you want to study today?</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TILES.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="rounded-2xl border border-ink/10 bg-card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all focus-ring"
            >
              <Icon className="text-indigo mb-3" size={22} />
              <h3 className="font-display font-semibold">{label}</h3>
              <p className="text-sm text-ink/60">{desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-ink/10 bg-card p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-ink/60">Your XP</p>
            <p className="font-display text-2xl font-semibold">{user?.xp ?? 0} XP</p>
          </div>
          <Link href="/profile" className="text-sm font-medium text-indigo underline underline-offset-4">
            View progress
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
