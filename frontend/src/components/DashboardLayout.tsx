import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { Navbar } from "./Navbar";

export function DashboardLayout({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
              {badge}
            </span>
            <h1 className="mt-3 font-display text-4xl font-semibold text-ink">{title}</h1>
            <p className="mt-1 text-ink-soft">{subtitle}</p>
          </div>
        </motion.div>
        {children}
      </main>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  delay = 0,
}: {
  label: string;
  value: string;
  hint?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
    >
      <p className="text-sm font-medium text-ink-soft">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-ink">{value}</p>
      {hint && <p className="mt-1 text-sm text-ink-soft/80">{hint}</p>}
    </motion.div>
  );
}
