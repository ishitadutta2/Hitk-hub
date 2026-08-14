"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/AppShell";
import { useStore } from "@/lib/store";
import { MAX_NOTE_PRICE, MIN_NOTE_PRICE } from "@/lib/types";

export default function UploadNotesPage() {
  const router = useRouter();
  const { user, addNote, subjectsByDept, loading } = useStore();
  const subjects = subjectsByDept[user?.departmentCode ?? ""] ?? [];

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState(20);
  const [previewPages, setPreviewPages] = useState(2);
  const [price, setPrice] = useState(49);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const activeSubject = subject || subjects[0] || "";

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push("/login");
      return;
    }
    if (!user.onboarded) {
      setError("Complete onboarding (pick a department/year) before selling notes.");
      return;
    }
    if (price < MIN_NOTE_PRICE || price > MAX_NOTE_PRICE) {
      setError(`Price must be between ₹${MIN_NOTE_PRICE} and ₹${MAX_NOTE_PRICE}.`);
      return;
    }
    if (!title || !description || !activeSubject) {
      setError("Please fill in a title, subject, and description.");
      return;
    }
    if (!file) {
      setError("Please attach a PDF.");
      return;
    }
    setError("");
    setSubmitting(true);
    const result = await addNote({
      title,
      subjectName: activeSubject,
      description,
      price,
      pages,
      previewPages,
      file,
    });
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.push("/notes");
  };

  return (
    <AppShell>
      <div className="max-w-xl">
        <h1 className="font-display text-2xl font-semibold mb-1">Sell your notes</h1>
        <p className="text-ink/60 mb-6">
          You set the price. New listings go to <strong>pending review</strong> until an admin approves them.
        </p>

        <form onSubmit={onSubmit} className="rounded-2xl border border-ink/10 bg-card p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Complete DBMS Notes"
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
              Subject ({user?.departmentCode ?? "—"})
            </label>
            <select
              value={activeSubject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm bg-white focus-ring"
            >
              {subjects.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {subjects.length === 0 && (
              <p className="text-xs text-rose mt-1">
                No subjects seeded for your department yet — add rows to the `subjects` table.
              </p>
            )}
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Complete handwritten notes covering..."
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Upload file (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 w-full text-sm"
            />
            {file && <p className="text-xs text-ink/50 mt-1">Selected: {file.name}</p>}
            <p className="text-xs text-ink/40 mt-1">
              Uploaded to a private Storage bucket — buyers only get a 5-minute signed link after a
              verified purchase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Total pages</label>
              <input
                type="number"
                min={1}
                value={pages}
                onChange={(e) => setPages(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">Free preview pages</label>
              <input
                type="number"
                min={0}
                value={previewPages}
                onChange={(e) => setPreviewPages(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-ink/60 uppercase tracking-wide">
              Price (₹{MIN_NOTE_PRICE}–₹{MAX_NOTE_PRICE})
            </label>
            <input
              type="number"
              min={MIN_NOTE_PRICE}
              max={MAX_NOTE_PRICE}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-ink/15 px-3 py-2 text-sm focus-ring"
            />
          </div>

          {error && <p className="text-rose text-sm">{error}</p>}

          <button
            disabled={submitting || loading}
            className="w-full bg-indigo text-white rounded-full py-2.5 font-medium hover:bg-indigo-dark transition-colors focus-ring disabled:opacity-60"
          >
            {submitting ? "Uploading..." : "Submit for review"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
