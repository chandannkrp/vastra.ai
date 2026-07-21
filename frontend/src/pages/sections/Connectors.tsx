import { motion } from "framer-motion";
import { CheckCircle2, Plug, RefreshCw, Store, Unplug, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLoader, BrandLoaderRow } from "../../components/BrandLoader";
import {
  connectShopify,
  disconnectShopify,
  getShopifyStatus,
  type ConnectorStatus,
} from "../../lib/catalog";
import { usePipelineDock } from "../../lib/pipelineDock";

type Mode = "client" | "token";

export function Connectors() {
  const { notify } = usePipelineDock();
  const [status, setStatus] = useState<ConnectorStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<Mode>("client");
  const [form, setForm] = useState({ store_domain: "", admin_token: "", client_id: "", client_secret: "" });

  function refresh() {
    setLoading(true);
    getShopifyStatus()
      .then(setStatus)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function save() {
    if (!form.store_domain.trim()) {
      notify("Enter your store domain.", "error");
      return;
    }
    setSaving(true);
    try {
      const payload =
        mode === "token"
          ? { store_domain: form.store_domain, admin_token: form.admin_token }
          : { store_domain: form.store_domain, client_id: form.client_id, client_secret: form.client_secret };
      const s = await connectShopify(payload);
      setStatus(s);
      setEditing(false);
      setForm({ store_domain: "", admin_token: "", client_id: "", client_secret: "" });
      notify(`Connected to ${s.shop_name ?? "your store"}.`, "success");
    } catch (e) {
      const msg = (e as { response?: { data?: { detail?: string } } }).response?.data?.detail;
      notify(msg ?? "Could not connect. Check your credentials.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function disconnect() {
    await disconnectShopify();
    notify("Store disconnected.", "info");
    refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">Connectors</h2>
        <p className="text-ink-soft">Connect your own Shopify store so the Publisher agent can list products to it.</p>
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
              <p className="text-sm text-ink-soft">
                {status?.store_domain ? status.store_domain : "Your storefront"}
              </p>
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
            <BrandLoaderRow label="Checking connection…" />
          ) : status?.connected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-emerald-700">
                <CheckCircle2 size={18} />
                <span className="font-medium">Connected{status.shop_name ? ` — ${status.shop_name}` : ""}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(true); setForm((f) => ({ ...f, store_domain: status.store_domain ?? "" })); }}
                  className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-ink-soft transition hover:border-indigo-300">
                  Update credentials
                </button>
                <button onClick={disconnect}
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-terracotta transition hover:border-terracotta/40">
                  <Unplug size={14} /> Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl bg-cream-deep px-4 py-3 text-ink-soft">
                <XCircle size={18} /> <span className="font-medium">Not connected</span>
              </div>
              {status?.detail && <p className="text-sm text-ink-soft">{status.detail}</p>}
              {!editing && (
                <button onClick={() => setEditing(true)}
                  className="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-indigo-800">
                  <Plug size={15} /> Connect your store
                </button>
              )}
            </div>
          )}
        </div>

        {/* Connect / update form */}
        {editing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-6 space-y-4 overflow-hidden border-t border-black/5 pt-6"
          >
            <Field label="Store domain">
              <input
                value={form.store_domain}
                onChange={(e) => setForm((f) => ({ ...f, store_domain: e.target.value }))}
                placeholder="your-store.myshopify.com"
                className="vinput"
              />
            </Field>

            <div className="flex gap-1.5 rounded-xl bg-cream-deep p-1">
              {(["client", "token"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition ${mode === m ? "bg-white text-indigo-700 shadow-sm" : "text-ink-soft"}`}>
                  {m === "client" ? "Client ID + Secret" : "Admin API token"}
                </button>
              ))}
            </div>

            {mode === "client" ? (
              <>
                <Field label="Client ID">
                  <input value={form.client_id} onChange={(e) => setForm((f) => ({ ...f, client_id: e.target.value }))} placeholder="e.g. 75d908…" className="vinput" />
                </Field>
                <Field label="Client Secret">
                  <input type="password" value={form.client_secret} onChange={(e) => setForm((f) => ({ ...f, client_secret: e.target.value }))} placeholder="shpss_…" className="vinput" />
                </Field>
              </>
            ) : (
              <Field label="Admin API access token">
                <input type="password" value={form.admin_token} onChange={(e) => setForm((f) => ({ ...f, admin_token: e.target.value }))} placeholder="shpat_…" className="vinput" />
              </Field>
            )}

            <div className="flex gap-2">
              <button onClick={save} disabled={saving}
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-indigo-800 disabled:opacity-60">
                {saving ? <BrandLoader size={15} /> : <Plug size={15} />}
                {saving ? "Testing & saving…" : "Test & connect"}
              </button>
              <button onClick={() => setEditing(false)} className="rounded-xl border border-black/10 px-5 py-2.5 text-sm font-medium text-ink-soft hover:border-indigo-300">
                Cancel
              </button>
            </div>
            <p className="text-xs text-ink-soft">We verify the credentials against your store before saving — nothing is stored if the test fails.</p>
          </motion.div>
        )}

        {!status?.connected && !editing && !loading && (
          <div className="mt-6 rounded-2xl bg-indigo-50/60 p-5">
            <p className="mb-2 flex items-center gap-2 font-semibold text-indigo-800">
              <Plug size={16} /> How to connect
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-soft">
              <li>Shopify admin → Settings → Apps → Develop apps → create an app.</li>
              <li>Grant scopes: <code>read_products, write_products, write_files</code>, then install it.</li>
              <li>Copy either the <strong>Admin API access token</strong> (shpat_…), or the app's <strong>Client ID + Client Secret</strong>.</li>
              <li>Paste them above and hit <strong>Test &amp; connect</strong>.</li>
            </ol>
          </div>
        )}
      </motion.div>

      <style>{`.vinput{width:100%;border-radius:0.75rem;border:1px solid rgba(0,0,0,0.1);background:#fff;padding:0.6rem 0.9rem;font-size:0.875rem;outline:none;color:#1c1633}.vinput:focus{border-color:#5f43c4;box-shadow:0 0 0 2px rgba(95,67,196,0.15)}`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
