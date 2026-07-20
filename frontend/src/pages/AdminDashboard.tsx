import { motion } from "framer-motion";
import { Bot, ShieldCheck, Store, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardLayout, StatCard } from "../components/DashboardLayout";
import { useAuth } from "../lib/auth";
import { getAnalytics, getShopifyStatus, type AnalyticsSummary, type ConnectorStatus } from "../lib/catalog";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [shopify, setShopify] = useState<ConnectorStatus | null>(null);

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch(() => {});
    getShopifyStatus().then(setShopify).catch(() => {});
  }, []);

  const AGENT_STATUS = [
    { name: "Intake agent", state: "Ready" },
    { name: "Image agent", state: "Dry-run" },
    { name: "Listing agent", state: "Ready" },
    { name: "Marketing agent", state: "Ready" },
    { name: "Publisher (Shopify)", state: shopify?.connected ? "Ready" : "Not connected" },
  ];

  return (
    <DashboardLayout
      badge="Admin"
      title="Control room"
      subtitle={`Signed in as ${user?.email}`}
    >
      <div className="grid gap-5 sm:grid-cols-3">
        <StatCard label="Submissions" value={String(analytics?.total_submissions ?? "—")} hint="Total processed" delay={0} />
        <StatCard label="Ready / published" value={String(analytics?.ready ?? "—")} hint="Products staged or live" delay={0.08} />
        <StatCard label="Images generated" value={String(analytics?.images_generated ?? "—")} hint="By the image agent" delay={0.16} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Agent fleet */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"
        >
          <div className="mb-5 flex items-center gap-2.5">
            <div className="inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
              <Bot size={20} />
            </div>
            <h2 className="text-xl font-semibold text-ink">Agent fleet</h2>
          </div>
          <ul className="divide-y divide-black/5">
            {AGENT_STATUS.map((a) => (
              <li key={a.name} className="flex items-center justify-between py-3.5">
                <span className="font-medium text-ink">{a.name}</span>
                <StatePill state={a.state} />
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28 }}
          className="space-y-6"
        >
          <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-semibold text-ink">Shopify</h3>
            <p className="mt-1 text-sm text-ink-soft">
              {shopify?.connected
                ? `Connected${shopify.shop_name ? ` — ${shopify.shop_name}` : ""}.`
                : "Connect the live Impulse store to enable publishing."}
            </p>
            <span
              className={`mt-4 inline-block rounded-full px-3 py-1 text-xs font-medium ${
                shopify?.connected ? "bg-emerald-50 text-emerald-700" : "bg-cream-deep text-ink-soft"
              }`}
            >
              {shopify?.connected ? "Connected" : "Not connected"}
            </span>
          </div>

          <div className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
            <div className="mb-3 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-700">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-semibold text-ink">Access</h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-ink-soft">
              <Users size={15} /> Seller &amp; admin roles active
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

function StatePill({ state }: { state: string }) {
  const tone =
    state === "Ready"
      ? "bg-emerald-50 text-emerald-700"
      : state === "Not connected"
        ? "bg-terracotta/10 text-terracotta"
        : "bg-cream-deep text-ink-soft";
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${tone}`}>{state}</span>
  );
}
