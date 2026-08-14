import Link from "next/link";
import { BookOpen, MessageCircleQuestion, ShoppingBag, Sparkles } from "lucide-react";
import PreviewModeBanner from "@/components/PreviewModeBanner";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-paper">
      {!isSupabaseConfigured && (
        <div className="pt-4">
          <PreviewModeBanner />
        </div>
      )}
      <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-display font-semibold text-lg">
          <span className="text-2xl">🎓</span> HITK Hub
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-ink focus-ring rounded px-2 py-1">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-ink text-paper rounded-full px-4 py-2 hover:bg-indigo-dark transition-colors focus-ring"
          >
            Create account
          </Link>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pt-10 pb-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="stamp inline-block text-rose text-[11px] font-mono font-bold uppercase mb-6 px-2 py-0.5">
            Not officially affiliated with HITK
          </span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold leading-[1.1] mb-5">
            Every question your seniors already solved,
            <span className="text-indigo"> stamped and filed.</span>
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            PYQs, important questions, solutions, doubt-solving and a student-run
            notes marketplace — one index card at a time.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/signup"
              className="bg-indigo text-white rounded-full px-6 py-3 font-medium hover:bg-indigo-dark transition-colors focus-ring"
            >
              Get started free
            </Link>
            <Link href="/login" className="text-sm font-medium underline underline-offset-4 text-ink/70 hover:text-ink focus-ring rounded">
              I already have an account
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="ticket-edge dashed-divider rounded-2xl border border-ink/15 bg-card p-6 shadow-md rotate-1">
            <p className="font-mono text-xs text-ink/50 mb-2">CS201 · DATA STRUCTURES · END SEM 2025</p>
            <p className="font-display font-semibold mb-3">Q3. Explain Binary Search Tree and its operations.</p>
            <p className="text-sm text-ink/70 mb-4">
              A Binary Search Tree is a hierarchical structure where every node&apos;s left
              subtree holds smaller values and right subtree holds larger values...
            </p>
            <div className="dashed-divider pt-3 flex gap-2">
              <span className="stamp text-sage text-[10px] font-mono font-bold uppercase px-2 py-0.5">Must Study</span>
              <span className="stamp text-gold text-[10px] font-mono font-bold uppercase px-2 py-0.5 rotate-2">Hard</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-24 grid sm:grid-cols-3 gap-6">
        <Feature icon={<BookOpen size={22} />} title="Study" desc="PYQs, important questions and clear solutions, organized by subject and semester." />
        <Feature icon={<MessageCircleQuestion size={22} />} title="Community" desc="Ask doubts, get answers from seniors, upvote what actually helped." />
        <Feature icon={<ShoppingBag size={22} />} title="Marketplace" desc="Buy and sell handwritten notes. Sellers set their own price." />
      </section>

      <footer className="border-t border-ink/10 py-6 text-center text-xs text-ink/50">
        <Sparkles size={14} className="inline mr-1" />
        An independent student-built platform. Not officially affiliated with Heritage Institute of Technology.
      </footer>
    </main>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-card p-6">
      <div className="text-indigo mb-3">{icon}</div>
      <h3 className="font-display font-semibold mb-1">{title}</h3>
      <p className="text-sm text-ink/60">{desc}</p>
    </div>
  );
}
