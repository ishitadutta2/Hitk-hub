import Link from "next/link";
import { Note } from "@/lib/types";
import Stars from "./Stars";
import StampBadge from "./StampBadge";

export default function NoteCard({ note }: { note: Note }) {
  const badge =
    note.rating >= 4.8 ? { label: "Top Rated", color: "gold" as const } :
    note.salesCount > 100 ? { label: "Bestseller", color: "sage" as const } :
    null;

  return (
    <Link
      href={`/notes/${note.id}`}
      className="ticket-edge dashed-divider block rounded-2xl border border-ink/10 bg-card p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all focus-ring"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="font-display font-semibold text-base leading-snug">{note.title}</h3>
        {badge && <StampBadge label={badge.label} color={badge.color} />}
      </div>
      <p className="text-xs text-ink/60 font-mono mb-3">
        {note.subjectName} • {note.pages} pages
      </p>
      <p className="text-sm text-ink/70 line-clamp-2 mb-4">{note.description}</p>
      <div className="dashed-divider pt-3 flex items-center justify-between">
        <Stars rating={note.rating} count={note.reviewCount} />
        <span className="font-display font-semibold text-lg">₹{note.price}</span>
      </div>
    </Link>
  );
}
