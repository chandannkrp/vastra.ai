import { motion } from "framer-motion";
import { CheckCircle2, Coins, ImageIcon, Layers, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { assetUrl } from "../../lib/api";
import {
  getAnalytics,
  listSubmissions,
  type AnalyticsSummary,
  type SubmissionListItem,
} from "../../lib/catalog";

export function Overview({ onOpen }: { onOpen: (tab: string) => void }) {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [subs, setSubs] = useState<SubmissionListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalytics(), listSubmissions()])
      .then(([a, s]) => {
        setAnalytics(a);
        setSubs(s);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink-soft">
        <Loader2 className="animate-spin" size={18} /> Loading…
      </div>
    );
  }

  const stats = [
    { icon: Layers, label: "Total products", value: analytics?.total_submissions ?? 0, tone: "text-indigo-700 bg-indigo-50" },
    { icon: Loader2, label: "Processing", value: analytics?.processing ?? 0, tone: "text-saffron-600 bg-saffron-300/40" },
    { icon: CheckCircle2, label: "Ready / published", value: analytics?.ready ?? 0, tone: "text-emerald-700 bg-emerald-50" },
    { icon: ImageIcon, label: "Images generated", value: analytics?.images_generated ?? 0, tone: "text-indigo-700 bg-indigo-50" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
          >
            <div className={`mb-4 inline-flex rounded-xl p-2.5 ${s.tone}`}>
              <s.icon size={20} />
            </div>
            <p className="font-display text-3xl font-semibold text-ink">{s.value}</p>
            <p className="text-sm text-ink-soft">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-black/5 bg-white px-6 py-4 text-sm text-ink-soft shadow-sm">
        <Coins size={16} className="text-saffron-500" />
        <span className="font-medium text-ink">{(analytics?.tokens_used ?? 0).toLocaleString()}</span>
        LLM tokens used across all runs
      </div>

      {/* Recent submissions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-semibold text-ink">Recent products</h3>
          <button onClick={() => onOpen("new")} className="text-sm font-semibold text-indigo-700 hover:underline">
            + Add product
          </button>
        </div>

        {subs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-black/10 bg-cream-deep/40 px-6 py-12 text-center text-ink-soft">
            No products yet. Add your first fabric to see the agents in action.
          </div>
        ) : (
          <div className="space-y-3">
            {subs.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-cream-deep">
                  {s.thumbnail_url && (
                    <img src={assetUrl(s.thumbnail_url)} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink">{s.title || "Untitled fabric"}</p>
                  <p className="text-sm text-ink-soft">{s.fabric_type || "—"}</p>
                </div>
                {s.status === "processing" || s.status === "pending" ? (
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-cream-deep">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-saffron-500"
                        style={{ width: `${s.percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-ink-soft">{s.percent}%</span>
                  </div>
                ) : (
                  <StatusBadge status={s.status} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
