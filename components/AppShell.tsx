"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  FileQuestion,
  MessageCircleQuestion,
  ShoppingBag,
  Wallet,
  Trophy,
  Settings,
  LayoutGrid,
  Search,
  Bell,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { ReactNode } from "react";
import PreviewModeBanner from "./PreviewModeBanner";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/pyqs", label: "PYQs", icon: BookOpen },
  { href: "/questions", label: "Questions", icon: FileQuestion },
  { href: "/doubts", label: "Doubts", icon: MessageCircleQuestion },
  { href: "/notes", label: "Marketplace", icon: ShoppingBag },
  { href: "/purchases", label: "Purchases", icon: Wallet },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, configured } = useStore();

  return (
    <div className="min-h-screen flex">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-ink/10 bg-paper/60 px-4 py-6">
        <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
          <span className="text-2xl">🎓</span>
          <span className="font-display font-semibold text-lg tracking-tight">HITK Hub</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-ring ${
                  active
                    ? "bg-indigo text-white"
                    : "text-ink/70 hover:bg-ink/5 hover:text-ink"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        {isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-rose hover:bg-rose/10 focus-ring"
          >
            <ShieldCheck size={18} /> Admin
          </Link>
        )}
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center gap-3 border-b border-ink/10 bg-paper/80 px-4 md:px-6 py-3 sticky top-0 z-10 backdrop-blur">
          <div className="md:hidden font-display font-semibold">🎓 HITK Hub</div>
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" />
            <input
              placeholder="Search PYQs, subjects, notes..."
              className="w-full rounded-full border border-ink/15 bg-white pl-9 pr-4 py-2 text-sm focus-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  router.push(`/notes?q=${encodeURIComponent((e.target as HTMLInputElement).value)}`);
                }
              }}
            />
          </div>
          <div className="ml-auto flex items-center gap-4">
            <button aria-label="Notifications" className="text-ink/60 hover:text-ink focus-ring rounded-full p-1">
              <Bell size={20} />
            </button>
            <Link href="/profile" className="flex items-center gap-2 focus-ring rounded-full">
              <span className="h-8 w-8 rounded-full bg-indigo text-white grid place-items-center text-sm font-semibold">
                {user?.name?.[0]?.toUpperCase() ?? "?"}
              </span>
              <span className="hidden sm:inline text-sm font-medium">{user?.name ?? "Guest"}</span>
            </Link>
          </div>
        </header>
        {!configured && (
          <div className="px-4 md:px-8 pt-4">
            <PreviewModeBanner />
          </div>
        )}
        <main className="flex-1 px-4 md:px-8 py-6">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 bg-white border-t border-ink/10 flex justify-around py-2">
        {NAV.slice(0, 5).map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} className={`flex flex-col items-center text-[10px] gap-0.5 px-2 py-1 ${active ? "text-indigo" : "text-ink/50"}`}>
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
