import { motion } from "framer-motion";
import { Coins, Sparkles, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart } from "../../components/BarChart";
import { BrandLoader, BrandLoaderPanel } from "../../components/BrandLoader";
import {
  checkout,
  getPacks,
  getTokenSummary,
  verifyCheckout,
  type TokenPack,
  type TokenSummary,
} from "../../lib/catalog";
import { usePipelineDock } from "../../lib/pipelineDock";

export function Tokens() {
  const [summary, setSummary] = useState<TokenSummary | null>(null);
  const [packs, setPacks] = useState<TokenPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const { notify } = usePipelineDock();
  const [params, setParams] = useSearchParams();

  async function refresh() {
    const [s, p] = await Promise.all([getTokenSummary(), getPacks()]);
    setSummary(s);
    setPacks(p.packs);
  }

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  // Handle Stripe redirect back (?checkout=success&session_id=...)
  useEffect(() => {
    if (params.get("checkout") === "success" && params.get("session_id")) {
      verifyCheckout(params.get("session_id")!).then((r) => {
        if (r.ok) {
          notify(`Payment confirmed — ${(r.credited ?? 0).toLocaleString()} tokens added.`, "success");
          refresh();
        }
        params.delete("checkout");
        params.delete("session_id");
        setParams(params, { replace: true });
      });
    } else if (params.get("checkout") === "cancel") {
      notify("Checkout cancelled.", "info");
      params.delete("checkout");
      setParams(params, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function buy(pack: TokenPack) {
    setBusy(pack.id);
    try {
      const r = await checkout(pack.id);
      if (r.url) {
        window.location.href = r.url; // Stripe Checkout
      } else if (r.mock) {
        notify(`Added ${(r.credited ?? pack.tokens).toLocaleString()} tokens (demo).`, "success");
        refresh();
      }
    } catch {
      notify("Could not start checkout.", "error");
    } finally {
      setBusy(null);
    }
  }

  if (loading || !summary) {
    return <BrandLoaderPanel label="Loading usage…" />;
  }

  const chartData = summary.daily.map((d) => ({ label: d.date.slice(5), value: d.tokens }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Tokens & usage</h2>
        <p className="text-ink-soft">
          Tokens power the AI agents — text, image generation, and everything in between.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-[1.3fr_1fr]">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><Coins size={20} /></div>
              <h3 className="font-semibold text-ink">Balance</h3>
            </div>
            <span className="text-sm font-medium text-ink-soft">{summary.percent_used}% used</span>
          </div>
          <p className="font-display text-4xl font-semibold text-ink">
            {summary.remaining.toLocaleString()}
            <span className="ml-2 text-lg font-normal text-ink-soft">/ {summary.limit.toLocaleString()} left</span>
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-cream-deep">
            <motion.div className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-saffron-500" initial={{ width: 0 }} animate={{ width: `${summary.percent_used}%` }} transition={{ duration: 0.7 }} />
          </div>
          <p className="mt-2 text-sm text-ink-soft">{summary.used.toLocaleString()} tokens used so far</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
          <h3 className="mb-1 font-semibold text-ink">Last 14 days</h3>
          <p className="mb-4 text-sm text-ink-soft">Token consumption per day</p>
          <BarChart data={chartData} height={120} />
        </motion.div>
      </div>

      <div>
        <h3 className="mb-4 font-semibold text-ink">Top up</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {packs.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm ${p.popular ? "border-indigo-600 ring-2 ring-indigo-600" : "border-black/5"}`}
            >
              {p.popular && (
                <span className="absolute -top-2.5 left-6 rounded-full bg-indigo-700 px-2.5 py-0.5 text-xs font-semibold text-cream">Popular</span>
              )}
              <div className="mb-3 inline-flex rounded-lg bg-saffron-300/40 p-2 text-saffron-600"><Zap size={18} /></div>
              <p className="font-semibold text-ink">{p.label}</p>
              <p className="font-display text-2xl font-semibold text-ink">₹{(p.amount / 100).toLocaleString()}</p>
              <p className="text-sm text-ink-soft">{p.tokens.toLocaleString()} tokens</p>
              <p className="text-xs text-ink-soft/70">≈ {p.approx_products} products</p>
              <button
                disabled={busy === p.id}
                onClick={() => buy(p)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-cream transition hover:bg-indigo-800 disabled:opacity-60"
              >
                {busy === p.id ? <BrandLoader size={15} /> : <Sparkles size={15} />}
                Buy tokens
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
