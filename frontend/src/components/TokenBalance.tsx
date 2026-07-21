import { Coins, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTokenSummary, type TokenSummary } from "../lib/catalog";

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${Math.round(n / 1000)}k`;
  return String(n);
}

/** Compact token balance for the top bar, with a quick top-up link. */
export function TokenBalance() {
  const [summary, setSummary] = useState<TokenSummary | null>(null);

  useEffect(() => {
    let active = true;
    const load = () => getTokenSummary().then((s) => active && setSummary(s)).catch(() => {});
    load();
    const t = setInterval(load, 20000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  const low = summary ? summary.percent_used >= 80 : false;

  return (
    <Link
      to="/dashboard?tab=tokens"
      className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition sm:inline-flex ${
        low ? "border-terracotta/40 bg-terracotta/10 text-terracotta" : "border-black/10 bg-white text-ink-soft hover:border-indigo-300"
      }`}
      title="Token balance — click to top up"
    >
      <Coins size={15} className={low ? "text-terracotta" : "text-saffron-500"} />
      {summary ? fmt(summary.remaining) : "—"}
      <span className="ml-1 inline-flex items-center gap-0.5 rounded-full bg-indigo-700 px-2 py-0.5 text-xs text-cream">
        <Plus size={11} /> Top up
      </span>
    </Link>
  );
}
