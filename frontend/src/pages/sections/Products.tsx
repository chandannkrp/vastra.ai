import { motion } from "framer-motion";
import { Loader2, PackageOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { StatusBadge } from "../../components/StatusBadge";
import { assetUrl } from "../../lib/api";
import { listProducts, type ProductCard } from "../../lib/catalog";

export function Products({ onOpen }: { onOpen: (tab: string) => void }) {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listProducts()
      .then(setProducts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-ink-soft">
        <Loader2 className="animate-spin" size={18} /> Loading gallery…
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 bg-cream-deep/40 px-6 py-20 text-center">
        <div className="mb-4 inline-flex rounded-2xl bg-white p-4 text-indigo-700 shadow-sm">
          <PackageOpen size={30} />
        </div>
        <h3 className="text-lg font-semibold text-ink">No processed products yet</h3>
        <p className="mt-1 max-w-sm text-ink-soft">
          Products appear here once the agents finish processing them.
        </p>
        <button
          onClick={() => onOpen("new")}
          className="mt-5 rounded-full bg-indigo-700 px-6 py-2.5 text-sm font-semibold text-cream"
        >
          Add a product
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p, i) => (
        <motion.div
          key={p.submission_id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="aspect-[4/3] overflow-hidden bg-cream-deep">
            {p.thumbnail_url && (
              <img
                src={assetUrl(p.thumbnail_url)}
                alt={p.title}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h3 className="font-semibold text-ink">{p.title}</h3>
              <StatusBadge status={p.shopify_status ?? p.status} />
            </div>
            <p className="text-sm text-ink-soft">{p.fabric_type ?? "—"}</p>
            {p.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.tags.slice(0, 3).map((t) => (
                  <span key={t} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
