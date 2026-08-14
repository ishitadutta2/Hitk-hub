import { Star } from "lucide-react";

export default function Stars({ rating, count }: { rating: number; count?: number }) {
  return (
    <div className="flex items-center gap-1 text-gold">
      <Star size={14} fill="currentColor" />
      <span className="text-sm font-medium text-ink">{rating.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-xs text-ink/50">({count})</span>
      )}
    </div>
  );
}
