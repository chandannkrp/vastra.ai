import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  Layers,
  Lightbulb,
  Megaphone,
  Palette,
  ScanSearch,
  Shirt,
  Sparkles,
  Store,
  Sun,
  Type,
  Wand2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { Reveal } from "../components/Reveal";
import { useAuth } from "../lib/auth";

const AGENTS = [
  { key: "intake", icon: ScanSearch, name: "Intake agent", desc: "Reads your photos and notes, extracts fabric type, weave, composition, colour and tags — flagging anything unclear." },
  { key: "image", icon: Wand2, name: "Image agent", desc: "Upscales your raw shots into professional studio visuals — flat-lay, draped, on-model — keeping the real weave, texture and colour intact." },
  { key: "listing", icon: Sparkles, name: "Listing agent", desc: "Writes the product listing in the tone you choose — editorial, technical or minimal — with variants and metafields." },
  { key: "marketing", icon: Megaphone, name: "Marketing agent", desc: "Keeps your store fresh: lookbooks, collection copy and marketing updates, long after the product goes live." },
];

const GENERATION_TIPS = [
  { icon: Sun, title: "Shoot in natural light", body: "A window-lit photo gives the studio agent real texture and colour to work from — the model never has to guess." },
  { icon: Camera, title: "Fill the frame", body: "Get close and keep the fabric flat or naturally draped. Less background, more weave detail." },
  { icon: Type, title: "Write a specific description", body: "\"Softbox lighting, seamless grey backdrop\" beats \"nice photo\" — the more concrete, the more professional the result." },
  { icon: Shirt, title: "Try on-model for social", body: "The signature on-model shot is what performs best on Instagram and Shopify product pages alike." },
];

const STEPS = [
  { icon: Camera, title: "Snap & upload", body: "Raw phone photos and a few details. Bad lighting is fine." },
  { icon: Wand2, title: "Agents process", body: "Cleaned + generated imagery, extracted attributes, drafted copy." },
  { icon: Store, title: "Review & publish", body: "You approve; we publish straight to your Shopify store." },
];

const DYES = [
  { name: "Indigo", hex: "#3d2986" },
  { name: "Marigold", hex: "#f59e0b" },
  { name: "Madder", hex: "#c0392b" },
  { name: "Emerald", hex: "#127a5c" },
  { name: "Turmeric", hex: "#e0a70a" },
  { name: "Rani Pink", hex: "#d6336c" },
];

const lbImg = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=700&q=80`;
const LOOKBOOKS = [
  { title: "Festive Edit", img: lbImg("1610030469983-98e550d6193c"), accent: "from-rose-500/70 to-amber-500/60" },
  { title: "Summer Linens", img: lbImg("1441984904996-e0b6ba687e04"), accent: "from-emerald-500/70 to-cyan-500/60" },
  { title: "Heritage Weaves", img: lbImg("1487222477894-8943e31ef7b2"), accent: "from-indigo-500/70 to-fuchsia-500/60" },
];

const PRICING = [
  { name: "Free", price: "₹0", tokens: "1M tokens included", features: ["~14 products", "All 5 agents", "Local staging"], cta: "Start free", highlight: false },
  { name: "Studio", price: "₹1,199", tokens: "10M tokens", features: ["~140 products", "Shopify publishing", "Lookbooks & marketing", "Priority generation"], cta: "Go Studio", highlight: true },
  { name: "Scale", price: "₹4,499", tokens: "40M tokens", features: ["~570 products", "Everything in Studio", "Bulk automations", "Dedicated support"], cta: "Go Scale", highlight: false },
];

const TESTIMONIALS = [
  { quote: "We listed 40 fabrics in an afternoon. What used to need a photographer and a copywriter now just needs my phone.", name: "Aarti Textiles", role: "Surat" },
  { quote: "The generated shots kept our exact colours. Buyers finally trust what they see online.", name: "Modern Attires", role: "Delhi" },
  { quote: "Lookbooks and marketing copy on autopilot. I focus on sourcing, vastraas handles the storefront.", name: "Bunkar House", role: "Varanasi" },
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
              <Sparkles size={15} /> AI agents + a Fabric Studio for your store
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
              vastraas.ai turns badly-lit smartphone shots into professional,
              studio-grade product imagery and ready-to-sell listings — then
              publishes them to your Shopify store. Visualize, customize, and list
              in minutes, so you can focus entirely on your business.
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
              <a href="#studio" className="rounded-full border border-ink/10 px-7 py-3.5 font-semibold text-ink transition hover:border-indigo-300 hover:text-indigo-700">
                Explore Fabric Studio
              </a>
            </motion.div>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* Fabric Studio (USP) */}
      <section id="studio" className="bg-cream-deep py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 lg:grid-cols-2">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-wider text-saffron-600">The Fabric Studio</span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink">
              See your fabric become a product — before you shoot a thing
            </h2>
            <p className="mt-4 text-ink-soft">
              Upload a swatch and our studio visualizes it as finished product
              imagery. Restyle it as flat-lay, draped, or on-model, and preview
              different looks — all while keeping the true weave and colour of your
              cloth.
            </p>
            <ul className="mt-6 space-y-3">
              {["True-to-colour generation", "Multiple shot styles per fabric", "Indian dye & colour customization", "Download a ZIP or publish to Shopify"].map((f) => (
                <li key={f} className="flex items-center gap-3 text-ink">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <StudioVisual />
          </Reveal>
        </div>
      </section>

      {/* Customization & visualization */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold text-ink">Customize every detail</h2>
          <p className="mt-4 text-ink-soft">
            Pick dyes rooted in Indian textile tradition, choose shot styles and
            listing tone — the agents adapt the whole output to your choices.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Reveal>
            <CustomCard icon={Palette} title="Dyes & colours">
              <div className="mt-4 flex flex-wrap gap-2">
                {DYES.map((d) => (
                  <span key={d.name} className="flex items-center gap-1.5 rounded-full border border-black/5 bg-white px-2.5 py-1 text-xs font-medium text-ink">
                    <span className="h-3 w-3 rounded-full" style={{ background: d.hex }} />
                    {d.name}
                  </span>
                ))}
              </div>
            </CustomCard>
          </Reveal>
          <Reveal delay={0.08}>
            <CustomCard icon={Shirt} title="Shot styles">
              <div className="mt-4 grid grid-cols-2 gap-2">
                {["Flat-lay", "Draped", "Macro weave", "On-model"].map((s) => (
                  <span key={s} className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium text-ink-soft">{s}</span>
                ))}
              </div>
            </CustomCard>
          </Reveal>
          <Reveal delay={0.16}>
            <CustomCard icon={Layers} title="Listing tone">
              <div className="mt-4 space-y-2">
                {["Editorial", "Technical", "Minimal", "Storytelling"].map((s) => (
                  <span key={s} className="block rounded-lg bg-white px-3 py-2 text-sm font-medium text-ink-soft">{s}</span>
                ))}
              </div>
            </CustomCard>
          </Reveal>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-semibold text-ink">From camera roll to storefront in three moves</h2>
            <p className="mt-4 text-ink-soft">You take the photos — the agents do the rest.</p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.1}>
                <div className="relative h-full rounded-2xl border border-black/5 bg-white p-7 shadow-sm">
                  <span className="absolute right-6 top-6 font-display text-5xl font-semibold text-cream-deep">{i + 1}</span>
                  <div className="mb-5 inline-flex rounded-xl bg-indigo-50 p-3 text-indigo-700"><step.icon size={24} /></div>
                  <h3 className="text-xl font-semibold text-ink">{step.title}</h3>
                  <p className="mt-2 text-ink-soft">{step.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Meet the agents — a live-feeling animated workflow, not a static list */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-saffron-600">The team behind your store</span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Watch the agents work</h2>
          <p className="mt-4 text-ink-soft">
            Four specialist agents hand a product off to each other in sequence —
            here's what that looks like, running on autopilot.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <AgentWorkflowDemo />
        </Reveal>
      </section>

      {/* Generation tips */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-saffron-600">
              <Lightbulb size={15} /> Get better results
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Tips for sharper studio shots</h2>
            <p className="mt-4 text-ink-soft">
              The Fabric Studio only works with what you give it — a little care at
              upload time goes a long way.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {GENERATION_TIPS.map((tip, i) => (
              <Reveal key={tip.title} delay={i * 0.08}>
                <div className="h-full rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-2.5 text-indigo-700"><tip.icon size={20} /></div>
                  <h3 className="font-semibold text-ink">{tip.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tip.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook showcase */}
      <section className="bg-indigo-900 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-saffron-400">
              <BookOpen size={15} /> Lookbooks
            </span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-cream">Turn your catalogue into shoppable stories</h2>
            <p className="mt-4 text-indigo-200">
              Generate seasonal lookbooks and selling ideas from your own products —
              styled, captioned and ready to share.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {LOOKBOOKS.map((l, i) => (
              <Reveal key={l.title} delay={i * 0.08}>
                <div className="group overflow-hidden rounded-3xl bg-white/5 ring-1 ring-white/10">
                  <div className="relative h-56 overflow-hidden">
                    <img src={l.img} alt={l.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <div className={`absolute inset-0 bg-gradient-to-tr ${l.accent} opacity-70 mix-blend-multiply`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/80 to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream backdrop-blur">
                      <BookOpen size={11} /> Lookbook
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-cream">{l.title}</h3>
                    <p className="mt-1 text-sm text-indigo-200">AI-styled from your fabrics</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold text-ink">Simple, token-based pricing</h2>
          <p className="mt-4 text-ink-soft">
            Start free with a standard token grant. Top up any time — you only spend
            tokens when the agents run.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PRICING.map((tier, i) => (
            <Reveal key={tier.name} delay={i * 0.08}>
              <div
                className={`flex h-full flex-col rounded-3xl border p-7 shadow-sm ${
                  tier.highlight ? "border-indigo-600 bg-white ring-2 ring-indigo-600" : "border-black/5 bg-white"
                }`}
              >
                {tier.highlight && (
                  <span className="mb-3 w-fit rounded-full bg-indigo-700 px-3 py-1 text-xs font-semibold text-cream">Most popular</span>
                )}
                <h3 className="font-semibold text-ink">{tier.name}</h3>
                <p className="mt-2 font-display text-4xl font-semibold text-ink">{tier.price}</p>
                <p className="text-sm text-ink-soft">{tier.tokens}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-ink">
                      <Check size={16} className="text-emerald-600" strokeWidth={3} /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to={primaryCta}
                  className={`mt-7 rounded-full px-5 py-3 text-center font-semibold transition ${
                    tier.highlight ? "bg-indigo-700 text-cream hover:bg-indigo-800" : "border border-ink/10 text-ink hover:border-indigo-300"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-cream-deep py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-4xl font-semibold text-ink">Loved by fabric sellers</h2>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
                  <p className="flex-1 font-display text-lg leading-relaxed text-ink">“{t.quote}”</p>
                  <div className="mt-5">
                    <p className="font-semibold text-ink">{t.name}</p>
                    <p className="text-sm text-ink-soft">{t.role}</p>
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
              <h2 className="font-display text-4xl font-semibold text-cream sm:text-5xl">Your fabrics deserve a better storefront.</h2>
              <p className="mx-auto mt-4 max-w-xl text-indigo-200">
                Set up in minutes. Upload your first product and watch the agents build the listing for you.
              </p>
              <Link to={primaryCta} className="mt-9 inline-flex items-center gap-2 rounded-full bg-saffron-500 px-8 py-3.5 font-semibold text-ink shadow-lg transition hover:bg-saffron-400">
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

function CustomCard({ icon: Icon, title, children }: { icon: typeof Palette; title: string; children: React.ReactNode }) {
  return (
    <div className="h-full rounded-3xl border border-black/5 bg-cream-deep/50 p-6">
      <div className="mb-1 inline-flex rounded-xl bg-white p-2.5 text-indigo-700 shadow-sm"><Icon size={20} /></div>
      <h3 className="mt-2 font-semibold text-ink">{title}</h3>
      {children}
    </div>
  );
}

/** Auto-playing pipeline animation — shows the agent hand-off as it actually runs, instead of a static list. */
function AgentWorkflowDemo() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((i) => (i + 1) % AGENTS.length), 2600);
    return () => clearInterval(t);
  }, []);

  // A little "product" that visibly builds up as the agents hand off.
  const OUTPUT = ["raw photo", "studio shots", "listing", "live ✨"];

  return (
    <div className="mt-14 overflow-hidden rounded-3xl border border-black/5 bg-white p-6 shadow-sm sm:p-10">
      <div className="flex items-start gap-1 overflow-x-auto pb-2">
        {AGENTS.map((agent, i) => {
          const done = i < active;
          const running = i === active;
          return (
            <div key={agent.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <WorkflowConnector active={i > 0 && i <= active} live={running} hidden={i === 0} />
                <div className="relative">
                  {running && (
                    <motion.span
                      className="absolute -inset-2.5 rounded-full bg-indigo-500/20 blur-lg"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.95, 0.5] }}
                      transition={{ duration: 1.6, repeat: Infinity }}
                    />
                  )}
                  <motion.div
                    className={`relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 transition-colors sm:h-20 sm:w-20 ${
                      done
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : running
                          ? "border-indigo-700 bg-indigo-700 text-white"
                          : "border-black/10 bg-white text-ink-soft"
                    }`}
                    animate={running ? { y: [0, -4, 0], boxShadow: "0 0 0 8px rgba(95,67,196,0.14)" } : { y: 0 }}
                    transition={{ duration: 1.5, repeat: running ? Infinity : 0, ease: "easeInOut" }}
                  >
                    <AnimatePresence mode="wait">
                      {done ? (
                        <motion.span key="done" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}>
                          <Check size={24} strokeWidth={3} />
                        </motion.span>
                      ) : (
                        <motion.span key="icon" animate={running ? { scale: [1, 1.12, 1] } : {}} transition={{ duration: 1.5, repeat: Infinity }}>
                          <agent.icon size={26} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
                <WorkflowConnector active={i < active} live={i + 1 === active} hidden={i === AGENTS.length - 1} />
              </div>
              <p className={`mt-3 text-center text-xs font-semibold sm:text-sm ${running ? "text-indigo-700" : "text-ink"}`}>{agent.name}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={AGENTS[active].key}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="mx-auto mt-8 max-w-xl text-center leading-relaxed text-ink-soft"
        >
          {AGENTS[active].desc}
        </motion.p>
      </AnimatePresence>

      {/* Output building up, step by step */}
      <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-2">
        {OUTPUT.map((label, i) => {
          const reached = i <= active;
          return (
            <div key={label} className="flex items-center gap-2">
              <motion.div
                className={`flex h-9 items-center rounded-full border px-3 text-[11px] font-medium ${
                  reached ? "border-indigo-200 bg-indigo-50 text-indigo-700" : "border-black/10 bg-cream-deep text-ink-soft/50"
                }`}
                animate={i === active ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={{ duration: 1.4, repeat: i === active ? Infinity : 0 }}
              >
                {label}
              </motion.div>
              {i < OUTPUT.length - 1 && <span className={`h-px w-4 ${reached ? "bg-indigo-300" : "bg-black/10"}`} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function WorkflowConnector({ active, live = false, hidden }: { active: boolean; live?: boolean; hidden: boolean }) {
  if (hidden) return <div className="h-0.5 flex-1" />;
  return (
    <div className="relative h-0.5 flex-1 overflow-hidden rounded-full bg-black/10">
      <motion.div
        className="absolute inset-0 rounded-full bg-emerald-500"
        initial={false}
        animate={{ scaleX: active ? 1 : 0 }}
        style={{ transformOrigin: "left" }}
        transition={{ duration: 0.5 }}
      />
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

function StudioVisual() {
  return (
    <div className="rounded-3xl border border-black/5 bg-white p-6 shadow-2xl shadow-indigo-900/10">
      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="col-span-1 flex aspect-square items-center justify-center rounded-xl bg-cream-deep text-xs text-ink-soft">swatch</div>
        <ArrowInline />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="col-span-1 flex aspect-square items-center justify-center rounded-xl bg-gradient-to-br from-indigo-200 to-saffron-300/50 text-xs font-medium text-indigo-700"
        >
          product ✨
        </motion.div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {["flat-lay", "draped", "macro", "on-model"].map((s, i) => (
          <motion.div
            key={s}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex aspect-square items-center justify-center rounded-lg bg-cream-deep text-center text-[10px] text-ink-soft"
          >
            {s}
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function ArrowInline() {
  return (
    <div className="col-span-1 flex items-center justify-center text-indigo-400">
      <ArrowRight size={22} />
    </div>
  );
}

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
            <span className="h-2.5 w-2.5 rounded-full bg-saffron-500" /> Live pipeline
          </div>
          <span className="rounded-full bg-cream-deep px-2.5 py-1 text-xs font-medium text-ink-soft">Product #001</span>
        </div>
        <div className="mb-5 flex gap-3">
          <div className="flex h-24 flex-1 items-center justify-center rounded-xl bg-cream-deep text-xs text-ink-soft">raw photo</div>
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
              <chip.icon size={16} /> {chip.label}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
