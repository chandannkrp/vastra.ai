const STYLES: Record<string, { label: string; cls: string }> = {
  pending: { label: "Queued", cls: "bg-cream-deep text-ink-soft" },
  processing: { label: "Processing", cls: "bg-indigo-50 text-indigo-700" },
  awaiting_review: { label: "Ready to publish", cls: "bg-saffron-300/40 text-saffron-600" },
  published: { label: "Published", cls: "bg-emerald-50 text-emerald-700" },
  failed: { label: "Failed", cls: "bg-terracotta/10 text-terracotta" },
  rejected: { label: "Rejected", cls: "bg-terracotta/10 text-terracotta" },
  // shopify statuses
  draft_local: { label: "Staged (local)", cls: "bg-saffron-300/40 text-saffron-600" },
  DRAFT: { label: "Shopify draft", cls: "bg-indigo-50 text-indigo-700" },
  ACTIVE: { label: "Live on store", cls: "bg-emerald-50 text-emerald-700" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STYLES[status] ?? { label: status, cls: "bg-cream-deep text-ink-soft" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
