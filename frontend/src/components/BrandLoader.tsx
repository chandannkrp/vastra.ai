import { motion } from "framer-motion";

/**
 * vastraas.ai's signature loading mark — three interlacing "threads" weaving
 * through each other, indigo → saffron. Replaces every generic spinner.
 */
export function BrandLoader({
  size = 22,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  const threads = [
    { color: "#5f43c4", delay: 0 },
    { color: "#f59e0b", delay: 0.15 },
    { color: "#d9694a", delay: 0.3 },
  ];

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      >
        {threads.map((t, i) => (
          <motion.circle
            key={i}
            cx="12"
            cy="12"
            r="9"
            fill="none"
            stroke={t.color}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeDasharray="14 42"
            initial={{ rotate: i * 120 }}
            style={{ transformOrigin: "12px 12px" }}
            animate={{ strokeDashoffset: [0, -56] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: "linear", delay: t.delay }}
          />
        ))}
      </motion.svg>
    </span>
  );
}

/** Inline "Loading…" row — BrandLoader + label, for lists/panels. */
export function BrandLoaderRow({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 text-ink-soft">
      <BrandLoader size={18} />
      <span>{label}</span>
    </div>
  );
}

/** Full-panel centered loader, for page/section-level loading states. */
export function BrandLoaderPanel({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-ink-soft">
      <BrandLoader size={32} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
