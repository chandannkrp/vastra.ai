import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Plug, RefreshCw, Store, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getShopifyStatus, type ConnectorStatus } from "../../lib/catalog";

export function Connectors() {
  const [status, setStatus] = useState<ConnectorStatus | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    getShopifyStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Connectors</h2>
        <p className="text-ink-soft">Connect your live store so the Publisher agent can list products.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-black/5 bg-white p-7 shadow-sm"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">
              <Store size={26} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-ink">Shopify Admin API</h3>
              <p className="text-sm text-ink-soft">Impulse-theme storefront</p>
            </div>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-3 py-1.5 text-sm text-ink-soft transition hover:border-indigo-300"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center gap-2 text-ink-soft">
              <Loader2 className="animate-spin" size={18} /> Checking connection…
            </div>
          ) : status?.connected ? (
            <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
              <CheckCircle2 size={18} />
              <span className="font-medium">Connected{status.shop_name ? ` — ${status.shop_name}` : ""}</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-cream-deep px-4 py-3 text-ink-soft">
                <XCircle size={18} /> <span className="font-medium">Not connected</span>
              </div>
              <p className="text-sm text-ink-soft">{status?.detail}</p>
            </div>
          )}
        </div>

        {!status?.connected && !loading && (
          <div className="mt-6 rounded-2xl bg-indigo-50/60 p-5">
            <p className="mb-2 flex items-center gap-2 font-semibold text-indigo-800">
              <Plug size={16} /> How to connect
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
              <li>In Shopify admin → Settings → Apps → Develop apps → create an app.</li>
              <li>Grant scopes: <code>read_products, write_products, write_files</code>.</li>
              <li>Copy the Admin API access token.</li>
              <li>
                Set <code>SHOPIFY_STORE_DOMAIN</code> and <code>SHOPIFY_ADMIN_TOKEN</code> in the
                backend <code>.env</code>, then refresh.
              </li>
            </ol>
          </div>
        )}
      </motion.div>
    </div>
  );
}
