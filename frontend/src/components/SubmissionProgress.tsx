import { motion } from "framer-motion";
import { Loader2, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../lib/api";
import { getSubmission, type SubmissionDetail } from "../lib/catalog";
import { PipelineFlow } from "./PipelineFlow";
import { StatusBadge } from "./StatusBadge";

/** Polls a submission until the pipeline finishes, rendering live progress + results. */
export function SubmissionProgress({ id }: { id: string }) {
  const [detail, setDetail] = useState<SubmissionDetail | null>(null);
  const timer = useRef<number>(undefined);

  useEffect(() => {
    let stopped = false;
    async function tick() {
      try {
        const d = await getSubmission(id);
        if (stopped) return;
        setDetail(d);
        if (!d.progress.done && !d.progress.failed) {
          timer.current = window.setTimeout(tick, 2000);
        }
      } catch {
        if (!stopped) timer.current = window.setTimeout(tick, 3000);
      }
    }
    tick();
    return () => {
      stopped = true;
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [id]);

  if (!detail) {
    return (
      <div className="flex items-center gap-2 text-ink-soft">
        <Loader2 className="animate-spin" size={18} /> Starting the pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PipelineFlow progress={detail.progress} />
      {detail.progress.done && <ResultView detail={detail} />}
    </div>
  );
}

function ResultView({ detail }: { detail: SubmissionDetail }) {
  const listing = (detail.listing ?? {}) as Record<string, string | string[]>;
  const marketing = (detail.marketing ?? {}) as Record<string, string | string[]>;
  const generated = detail.images.filter((i) => i.kind === "enhanced");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid gap-6 lg:grid-cols-[1fr_1fr]"
    >
      {/* Generated imagery */}
      <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
        <h4 className="mb-4 font-semibold text-ink">Generated imagery</h4>
        <div className="grid grid-cols-2 gap-3">
          {generated.map((img) => (
            <div key={img.id} className="overflow-hidden rounded-xl bg-cream-deep">
              <img
                src={assetUrl(img.url)}
                alt={img.shot_type ?? "generated"}
                className="aspect-square w-full object-cover"
              />
              <p className="px-3 py-2 text-xs font-medium capitalize text-ink-soft">
                {img.shot_type?.replace("_", " ")}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Listing + marketing */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="font-semibold text-ink">Listing</h4>
            <StatusBadge status={detail.shopify_status ?? detail.submission.status} />
          </div>
          <p className="font-display text-lg font-semibold text-ink">
            {listing.title as string}
          </p>
          <div
            className="prose-sm mt-2 max-h-40 overflow-y-auto text-sm text-ink-soft"
            dangerouslySetInnerHTML={{ __html: (listing.description_html as string) ?? "" }}
          />
          {Array.isArray(listing.tags) && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(listing.tags as string[]).slice(0, 8).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700"
                >
                  <Tag size={11} /> {t}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm">
          <h4 className="mb-2 font-semibold text-ink">Marketing</h4>
          <p className="text-sm text-ink-soft">{marketing.marketing_blurb as string}</p>
          {Array.isArray(marketing.hashtags) && (
            <p className="mt-3 text-sm font-medium text-indigo-700">
              {(marketing.hashtags as string[]).join(" ")}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
