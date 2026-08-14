export default function StampBadge({
  label,
  color = "sage",
}: {
  label: string;
  color?: "sage" | "gold" | "rose" | "indigo";
}) {
  const colorMap: Record<string, string> = {
    sage: "text-sage",
    gold: "text-gold",
    rose: "text-rose",
    indigo: "text-indigo",
  };
  return (
    <span
      className={`stamp inline-block px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${colorMap[color]}`}
    >
      {label}
    </span>
  );
}
