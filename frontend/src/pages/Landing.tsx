import { motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Megaphone,
  ScanSearch,
  Sparkles,
  Store,
  Wand2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Reveal } from "../components/Reveal";
import { useAuth } from "../lib/auth";

const AGENTS = [
  {
    icon: ScanSearch,
    name: "Intake agent",
    desc: "Reads your photos and notes, extracts fabric type, weave, composition, colour and tags — and flags anything unclear.",
  },
  {
    icon: Wand2,
    name: "Image agent",
    desc: "Cleans and relights your raw shots and generates a fresh set of studio images — flat-lay, draped, macro — true to colour.",
  },
  {
    icon: Sparkles,
    name: "Listing agent",
    desc: "Writes the product listing in the tone you choose — editorial, technical or minimal — with variants and metafields.",
  },
  {
    icon: Megaphone,
    name: "Marketing agent",
    desc: "Keeps your store fresh: lookbooks, collection copy and marketing updates, long after the product goes live.",
  },
];

const STEPS = [
  { icon: Camera, title: "Snap & upload", body: "Raw phone photos and a few details. Bad lighting is fine." },
  { icon: Wand2, title: "Agents process", body: "Cleaned + generated imagery, extracted attributes, drafted copy." },
  { icon: Store, title: "Review & publish", body: "You approve; we publish straight to your Shopify store." },
];

export default function Landing() {
  const { user, role } = useAuth();
  const primaryCta = user ? (role === "admin" ? "/admin" : "/dashboard") : "/register";

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />

      {/* Hero */}
      <section className="weave-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:py-28">
          <div className="flex flex-col justify-center">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700"
            >
              <Sparkles size={15} /> A team of AI agents for your fabric store
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-5xl font-semibold leading-[1.05] tracking-tight text-ink sm:text-6xl"
            >
              Raw fabric photos in.
              <br />
              <span className="gradient-text">Polished storefront out.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft"
            >
              vastra.ai turns badly-lit smartphone shots into clean, generated
              product imagery and ready-to-sell listings — then publishes them to
              your Shopify store. Built for Indian designers and garmenters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                to={primaryCta}
                className="group inline-flex items-center gap-2 rounded-full bg-indigo-700 px-7 py-3.5 font-semibold text-cream shadow-lg shadow-indigo-700/20 transition hover:bg-indigo-800"
              >
                {user ? "Go to dashboard" : "Start selling smarter"}
                <ArrowRight size={18} className="transition group-hover:translate-x-1" />
              </Link>
              <a
                href="#how"
                className="rounded-full border border-ink/10 px-7 py-3.5 font-semibold text-ink transition hover:border-indigo-300 hover:text-indigo-700"
              >
                See how it works
              </a>
            </motion.div>
          </div>

          {/* Animated pipeline visual */}
          <HeroVisual />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold text-ink">
            From camera roll to storefront in three moves
          </h2>
          <p className="mt-4 text-ink-soft">
            No studio, no copywriter, no store-admin busywork. You take the photos —
            the agents do the rest.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="relative h-full rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
                <span className="absolute right-6 top-6 font-display text-5xl font-semibold text-cream-deep">
                  {i + 1}
                </span>
                <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-700">
                  <step.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-ink-soft">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Meet the agents */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-saffron-600">
              The team behind your store
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink">
              Meet your agents
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {AGENTS.map((agent, i) => (
              <Reveal key={agent.name} delay={i * 0.08}>
                <div className="group flex h-full gap-5 rounded-2xl border border-black/5 bg-white p-7 shadow-sm transition hover:shadow-md">
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-cream transition group-hover:scale-105">
                    <agent.icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-ink">{agent.name}</h3>
                    <p className="mt-2 leading-relaxed text-ink-soft">{agent.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-indigo-900 px-8 py-16 text-center shadow-xl">
            <div className="weave-bg absolute inset-0 opacity-40" />
            <div className="relative">
              <h2 className="font-display text-4xl font-semibold text-cream sm:text-5xl">
                Your fabrics deserve a better storefront.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-indigo-200">
                Set up in minutes. Upload your first product and watch the agents
                build the listing for you.
              </p>
              <Link
                to={primaryCta}
                className="mt-9 inline-flex items-center gap-2 rounded-full bg-saffron-500 px-8 py-3.5 font-semibold text-ink shadow-lg transition hover:bg-saffron-400"
              >
                {user ? "Open dashboard" : "Create your free account"}
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}

/** Floating, looping visual of the agent pipeline. */
function HeroVisual() {
  const chips = [
    { icon: ScanSearch, label: "Extracting attributes", tone: "bg-indigo-50 text-indigo-700" },
    { icon: Wand2, label: "Generating images", tone: "bg-saffron-300/40 text-saffron-600" },
    { icon: Sparkles, label: "Writing listing", tone: "bg-indigo-50 text-indigo-700" },
    { icon: Store, label: "Publishing to Shopify", tone: "bg-emerald-50 text-emerald-700" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.2 }}
      className="relative flex items-center justify-center"
    >
      <div className="w-full max-w-sm rounded-3xl border border-black/5 bg-white p-6 shadow-2xl shadow-indigo-900/10">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <span className="h-2.5 w-2.5 rounded-full bg-saffron-500" />
            Live pipeline
          </div>
          <span className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-medium text-ink-soft">
            Product #001
          </span>
        </div>

        <div className="mb-5 flex gap-3">
          <div className="flex h-24 flex-1 items-center justify-center rounded-xl bg-cream-deep text-xs text-ink-soft">
            raw photo
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity }}
            className="flex h-24 flex-1 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-saffron-300/40 text-xs font-medium text-indigo-700"
          >
            enhanced ✨
          </motion.div>
        </div>

        <div className="space-y-2.5">
          {chips.map((chip, i) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + i * 0.25 }}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${chip.tone}`}
            >
              <chip.icon size={16} />
              {chip.label}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
