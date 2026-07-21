import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Coins,
  LayoutGrid,
  Plug,
  Sparkles,
  Wand2,
} from "lucide-react";
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "../components/Navbar";
import { useAuth } from "../lib/auth";
import { Catalog } from "./sections/Catalog";
import { Connectors } from "./sections/Connectors";
import { Lookbooks } from "./sections/Lookbooks";
import { NewProduct } from "./sections/NewProduct";
import { Overview } from "./sections/Overview";
import { Tokens } from "./sections/Tokens";

const TABS = [
  { key: "overview", label: "Home", icon: LayoutGrid },
  { key: "new", label: "Studio", icon: Wand2, primary: true },
  { key: "catalog", label: "Catalog", icon: Sparkles },
  { key: "lookbooks", label: "Lookbooks", icon: BookOpen },
  { key: "tokens", label: "Tokens", icon: Coins },
  { key: "connectors", label: "Connectors", icon: Plug },
];

export default function SellerDashboard() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const initial = TABS.some((t) => t.key === params.get("tab")) ? params.get("tab")! : "overview";
  const [tab, setTab] = useState(initial);
  const firstName = user?.name.split(" ")[0] ?? "there";
  const initials = (user?.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 sm:px-6 lg:flex lg:items-start lg:gap-8 lg:px-8 lg:pt-8">
        {/* Desktop sidebar */}
        <aside className="sticky top-24 hidden w-64 shrink-0 flex-col gap-6 lg:flex">
          <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-500 font-display text-sm font-semibold text-cream">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{user?.name ?? "Seller"}</p>
                <p className="truncate text-xs text-ink-soft">Seller workspace</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-col gap-1 rounded-2xl border border-black/5 bg-white p-2 shadow-sm">
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition ${
                    active ? "text-indigo-700" : "text-ink-soft hover:text-ink"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-indigo-50"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <t.icon size={17} className="relative z-10 shrink-0" />
                  <span className="relative z-10 flex-1">{t.label}</span>
                  {t.primary && (
                    <span className="relative z-10 rounded-full bg-saffron-300/50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-saffron-600">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setTab("new")}
            className="group flex items-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-800 via-indigo-700 to-indigo-600 p-4 text-left shadow-lg shadow-indigo-900/20 transition hover:shadow-xl"
          >
            <div className="rounded-xl bg-white/10 p-2 text-saffron-300">
              <Sparkles size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-cream">Studio shoot</p>
              <p className="text-xs leading-snug text-cream/70">
                Model, drape &amp; texture shots from one photo
              </p>
            </div>
          </button>
        </aside>

        {/* Mobile tab bar */}
        <nav className="mb-6 flex gap-1.5 overflow-x-auto pb-1 lg:hidden">
          {TABS.map((t) => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? "bg-indigo-700 text-cream" : "bg-white text-ink-soft shadow-sm"
                }`}
              >
                <t.icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* Section content */}
        <div className="min-w-0 flex-1">
          {tab === "overview" && (
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-indigo-700">
                  Seller workspace
                </span>
                <h1 className="mt-3 font-display text-3xl font-semibold text-ink sm:text-4xl">
                  Hello, {firstName}
                </h1>
                <p className="mt-1 text-ink-soft">Upload fabrics and let your agents build the storefront.</p>
              </div>
              <button
                onClick={() => setTab("new")}
                className="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-cream shadow-md shadow-indigo-700/20 transition hover:bg-indigo-800"
              >
                <Sparkles size={16} /> New studio shoot
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {tab === "overview" && <Overview onOpen={setTab} />}
              {tab === "new" && <NewProduct />}
              {tab === "catalog" && <Catalog onOpen={setTab} />}
              {tab === "lookbooks" && <Lookbooks />}
              {tab === "tokens" && <Tokens />}
              {tab === "connectors" && <Connectors />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
