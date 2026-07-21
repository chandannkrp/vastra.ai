import { AnimatePresence, motion } from "framer-motion";
import { Camera, ImageIcon, Layers, Shirt, Sparkles, User } from "lucide-react";
import { useEffect, useState } from "react";

const SHOT_META: Record<string, { label: string; icon: typeof User }> = {
  on_model: { label: "On-model", icon: User },
  draped: { label: "Draped", icon: Shirt },
  flatlay: { label: "Flat-lay", icon: ImageIcon },
  flat_fold: { label: "Flat-fold", icon: Layers },
  macro: { label: "Macro weave", icon: Layers },
  closeup_texture: { label: "Texture", icon: Layers },
  lifestyle: { label: "Lifestyle", icon: Sparkles },
};

const CAPTIONS = [
  "Setting the studio lights…",
  "Draping your fabric…",
  "Fitting it to the silhouette…",
  "Rendering true-to-colour…",
  "Retouching the final frame…",
];

/**
 * Animated placeholder frames — one per requested shot — that shimmer while the
 * real studio images are being generated, then get replaced by the gallery.
 */
export function GeneratingGallery({ shots }: { shots: string[] }) {
  const list = shots.length ? shots : ["on_model", "draped", "flatlay"];
  const [caption, setCaption] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCaption((i) => (i + 1) % CAPTIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="rounded-3xl border border-black/5 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="relative inline-flex h-8 w-8 items-center justify-center">
          <motion.span
            className="absolute inset-0 rounded-full bg-indigo-100"
            animate={{ scale: [1, 1.4, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.8, repeat: Infinity }}
          />
          <Camera size={16} className="relative text-indigo-700" />
        </span>
        <div>
          <h4 className="font-display text-lg font-semibold text-ink">Shooting your studio set</h4>
          <div className="h-4 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={caption}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-xs text-ink-soft"
              >
                {CAPTIONS[caption]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {list.map((shot, i) => {
          const meta = SHOT_META[shot] ?? { label: shot.replace(/_/g, " "), icon: Sparkles };
          const Icon = meta.icon;
          return (
            <motion.div
              key={shot + i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-black/5 bg-cream-deep"
            >
              {/* Shimmer sweep */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 20%, rgba(95,67,196,0.10) 40%, rgba(245,158,11,0.12) 55%, transparent 75%)",
                  backgroundSize: "220% 100%",
                }}
                animate={{ backgroundPositionX: ["220%", "-20%"] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "linear", delay: i * 0.12 }}
              />
              {/* Pulsing frame label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-ink-soft/70">
                <motion.div
                  animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
                  className="inline-flex rounded-xl bg-white/70 p-2.5 shadow-sm"
                >
                  <Icon size={20} className="text-indigo-600" />
                </motion.div>
                <span className="text-[11px] font-semibold uppercase tracking-wide">{meta.label}</span>
              </div>
              {/* Bottom progress shimmer bar */}
              <div className="absolute inset-x-3 bottom-3 h-1 overflow-hidden rounded-full bg-black/5">
                <motion.div
                  className="h-full w-1/2 rounded-full bg-gradient-to-r from-indigo-500 to-saffron-500"
                  animate={{ x: ["-60%", "180%"] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
