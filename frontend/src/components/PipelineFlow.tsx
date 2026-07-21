import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Check,
  Megaphone,
  ScanSearch,
  Sparkles,
  Store,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import type { PipelineProgress, StageStatus } from "../lib/catalog";
import { BrandLoader } from "./BrandLoader";

const ICONS: Record<string, LucideIcon> = {
  extracting: ScanSearch,
  enhancing: Wand2,
  drafting: Sparkles,
  marketing: Megaphone,
  publishing: Store,
};

function nodeClasses(status: StageStatus): string {
  switch (status) {
    case "done":
      return "bg-emerald-600 text-white border-emerald-600";
    case "running":
      return "bg-indigo-700 text-white border-indigo-700";
    case "failed":
      return "bg-terracotta text-white border-terracotta";
    default:
      return "bg-white text-ink-soft border-black/10";
  }
}

export function PipelineFlow({ progress }: { progress: PipelineProgress }) {
  const { stages, percent, tokens, failed, error } = progress;

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Agent pipeline</h3>
          <p className="text-sm text-ink-soft">
            {failed
              ? "A stage failed — see details below."
              : percent === 100
                ? "All agents finished."
                : "Your agents are working…"}
          </p>
        </div>
        <div className="text-right">
          <span className="font-display text-2xl font-semibold text-indigo-700">{percent}%</span>
          {tokens > 0 && (
            <p className="text-xs text-ink-soft">{tokens.toLocaleString()} tokens</p>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8 h-2 overflow-hidden rounded-full bg-cream-deep">
        <motion.div
          className={`h-full rounded-full ${failed ? "bg-terracotta" : "bg-gradient-to-r from-indigo-600 to-saffron-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>

      {/* Node flow */}
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {stages.map((stage, i) => {
          const Icon = ICONS[stage.key] ?? Sparkles;
          const prevDone = stages[i - 1]?.status === "done";
          return (
            <div key={stage.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <Connector active={prevDone} live={stage.status === "running"} hidden={i === 0} />
                <div className="relative">
                  {/* Orbiting glow while running */}
                  {stage.status === "running" && (
                    <motion.span
                      className="absolute -inset-2 rounded-full bg-indigo-500/15 blur-md"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.5, 0.9, 0.5] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 ${nodeClasses(stage.status)}`}
                    animate={
                      stage.status === "running"
                        ? { y: [0, -3, 0], boxShadow: "0 0 0 6px rgba(95,67,196,0.14)" }
                        : { y: 0 }
                    }
                    transition={{ duration: 1.4, repeat: stage.status === "running" ? Infinity : 0, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      {stage.status === "done" ? (
                        <motion.span key="done" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}>
                          <Check size={22} strokeWidth={3} />
                        </motion.span>
                      ) : stage.status === "running" ? (
                        <motion.span key="run">
                          <BrandLoader size={22} />
                        </motion.span>
                      ) : stage.status === "failed" ? (
                        <AlertTriangle size={22} />
                      ) : (
                        <Icon size={22} />
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <Connector active={stage.status === "done"} live={stages[i + 1]?.status === "running"} hidden={i === stages.length - 1} />
              </div>
              <p className={`mt-3 text-center text-xs font-semibold ${stage.status === "running" ? "text-indigo-700" : "text-ink"}`}>
                {stage.label}
              </p>
              <p className="mt-1 line-clamp-2 h-8 text-center text-[11px] leading-tight text-ink-soft">
                {stage.detail || (stage.status === "running" ? "working…" : "")}
              </p>
            </div>
          );
        })}
      </div>

      {failed && error && (
        <div className="mt-4 rounded-xl bg-terracotta/10 px-4 py-3 text-sm text-terracotta">
          {error}
        </div>
      )}
    </div>
  );
}

function Connector({ active, live = false, hidden }: { active: boolean; live?: boolean; hidden: boolean }) {
  if (hidden) return <div className="h-0.5 flex-1" />;
  return (
    <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-black/10">
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: active ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.5 }}
      />
      {/* Travelling data pulse into the currently-running node */}
      {live && (
        <motion.div
          className="absolute top-0 h-full w-1/3 rounded-full bg-gradient-to-r from-transparent via-indigo-500 to-transparent"
          animate={{ x: ["-40%", "260%"] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
    </div>
  );
}
