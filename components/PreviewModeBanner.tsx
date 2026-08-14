import { AlertTriangle } from "lucide-react";

export default function PreviewModeBanner() {
  return (
    <div className="flex items-center gap-2 bg-gold/10 border border-gold/30 text-ink/80 text-xs px-4 py-2 rounded-full w-fit mx-auto">
      <AlertTriangle size={14} className="text-gold shrink-0" />
      <span>
        Preview mode — Supabase isn&apos;t connected, so nothing is saved. See{" "}
        <code className="font-mono">.env.local.example</code> to enable accounts and storage.
      </span>
    </div>
  );
}
