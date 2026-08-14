"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const router = useRouter();
  const { logout } = useStore();
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [doubtNotifs, setDoubtNotifs] = useState(true);

  const onLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <AppShell>
      <div className="max-w-lg">
        <h1 className="font-display text-2xl font-semibold mb-6">Settings</h1>

        <div className="rounded-2xl border border-ink/10 bg-card p-6 mb-6 space-y-4">
          <h2 className="font-display font-semibold">Notifications</h2>
          <Toggle
            label="Email me about new answers to my doubts"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <Toggle
            label="Notify me when someone answers my doubts"
            checked={doubtNotifs}
            onChange={setDoubtNotifs}
          />
        </div>

        <div className="rounded-2xl border border-rose/30 bg-card p-6">
          <h2 className="font-display font-semibold mb-2">Account</h2>
          <p className="text-sm text-ink/60 mb-4">Log out of HITK Hub on this device.</p>
          <button
            onClick={onLogout}
            className="rounded-full border border-rose text-rose px-5 py-2 text-sm font-medium hover:bg-rose/10 transition-colors focus-ring"
          >
            Log out
          </button>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <span className="text-sm">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors focus-ring ${checked ? "bg-indigo" : "bg-ink/20"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </label>
  );
}
