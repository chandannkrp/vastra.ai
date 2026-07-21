import { motion } from "framer-motion";
import { Clock, Tag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getSubmission, type ImageOut, type SubmissionDetail } from "../lib/catalog";
import { BrandLoaderRow } from "./BrandLoader";
import { GeneratingGallery } from "./GeneratingGallery";
import { ImageFeed } from "./ImageFeed";
import { PipelineFlow } from "./PipelineFlow";
import { StatusBadge } from "./StatusBadge";

function fmtDuration(s?: number | null): string | null {
  if (s == null) return null;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  return r ? `${m}m ${r}s` : `${m}m`;
}

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
    return <BrandLoaderRow label="Starting the pipeline…" />;
  }

  const isGeneratingImages = detail.progress.stages.some(
    (s) => s.key === "enhancing" && s.status === "running",
  );
  const requestedShots =
    ((detail.customization as { image_shots?: string[] } | null)?.image_shots) ?? [];

  return (
    <div className="space-y-6">
      <PipelineFlow progress={detail.progress} />
      {isGeneratingImages && <GeneratingGallery shots={requestedShots} />}
      {detail.progress.done && <ResultView detail={detail} />}
    </div>
  );
}

function ResultView({ detail }: { detail: SubmissionDetail }) {
  const listing = (detail.listing ?? {}) as Record<string, string | string[]>;
  const marketing = (detail.marketing ?? {}) as Record<string, string | string[]>;
  const [images, setImages] = useState<ImageOut[]>(detail.images);
  const took = fmtDuration(detail.progress.elapsed_seconds);
  const enhancedCount = images.filter((i) => i.kind === "enhanced").length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
        <span className="font-medium text-emerald-800">✨ {enhancedCount} studio shots ready</span>
        {took && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-emerald-700">
            <Clock size={14} /> Generated in {took}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <ImageFeed submissionId={detail.submission.id} images={images} onImagesChange={setImages} />

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
      </div>
    </motion.div>
  );
}
