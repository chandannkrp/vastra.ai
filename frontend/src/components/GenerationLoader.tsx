import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const CAPTIONS = [
  "Draping your fabric…",
  "Adjusting studio lighting…",
  "Fitting it to the silhouette…",
  "Rendering true-to-colour…",
  "Weaving in the final touches…",
];

/**
 * Immersive loading animation for image generation: a silhouette "wears" the
 * fabric while draping cloth motion plays, with rotating status captions.
 * Used anywhere a real gpt-image-1 call is in flight (15–20s), so the wait
 * feels like part of the product, not a stall.
 */
export function GenerationLoader({ compact = false }: { compact?: boolean }) {
  const [captionIndex, setCaptionIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setCaptionIndex((i) => (i + 1) % CAPTIONS.length), 2200);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 ${
        compact ? "p-6" : "p-10"
      }`}
    >
      <div className="relative" style={{ width: compact ? 96 : 140, height: compact ? 96 : 140 }}>
        {/* Silhouette */}
        <svg
          viewBox="0 0 100 140"
          className="absolute inset-0 h-full w-full opacity-30"
          fill="none"
        >
          <path
            d="M50 8c8 0 14 6 14 14s-6 14-14 14-14-6-14-14S42 8 50 8Z"
            fill="#faf6ee"
          />
          <path
            d="M28 50c4-6 12-10 22-10s18 4 22 10l6 60H22l6-60Z"
            fill="#faf6ee"
          />
        </svg>

        {/* Draping cloth sweeping over the silhouette */}
        <motion.div
          className="absolute inset-0 overflow-hidden rounded-2xl"
          style={{ maskImage: "linear-gradient(180deg, transparent, black 15%, black 85%, transparent)" }}
        >
          <motion.svg viewBox="0 0 100 140" className="h-full w-full" fill="none">
            <motion.path
              d="M10 90 Q 30 80, 50 92 T 90 88 L 90 140 L 10 140 Z"
              fill="url(#cloth-gradient)"
              animate={{
                d: [
                  "M10 95 Q 30 85, 50 97 T 90 93 L 90 140 L 10 140 Z",
                  "M10 55 Q 30 45, 50 60 T 90 52 L 90 140 L 10 140 Z",
                  "M10 55 Q 30 45, 50 60 T 90 52 L 90 140 L 10 140 Z",
                ],
              }}
              transition={{ duration: 2.6, times: [0, 0.6, 1], repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="cloth-gradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="55%" stopColor="#fbb748" />
                <stop offset="100%" stopColor="#d9694a" />
              </linearGradient>
            </defs>
          </motion.svg>
        </motion.div>

        {/* Shimmer sparkle */}
        <motion.div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-saffron-300"
          animate={{ opacity: [0, 1, 0], scale: [0.6, 1.3, 0.6] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="h-5 overflow-hidden text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={captionIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className={`font-medium text-indigo-100 ${compact ? "text-xs" : "text-sm"}`}
          >
            {CAPTIONS[captionIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
