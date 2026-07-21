import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Sparkles, TrendingUp, Wand2 } from "lucide-react";
import { usePipelineDock } from "../../lib/pipelineDock";

/** Free, open-source editorial imagery (Unsplash) — placeholders that make the
 *  lookbooks actually read as lookbooks until they're generated from real stock. */
const u = (id: string, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

interface Lookbook {
  issue: string;
  title: string;
  desc: string;
  tip: string;
  cover: string;
  shots: string[];
  accent: string;
}

const LOOKBOOKS: Lookbook[] = [
  {
    issue: "Issue 01 · Festive",
    title: "The Wedding Edit",
    desc: "Silks, brocades and zari, styled for the season buyers spend the most in.",
    tip: "Festive drapes shot on-model sell up to 3× faster than flat-lays.",
    cover: u("1610030469983-98e550d6193c", 1100),
    shots: [u("1524863479829-916d8e77f114", 500), u("1595777457583-95e059d581b8", 500), u("1490481651871-ab68de25d43d", 500)],
    accent: "from-rose-500/80 to-amber-500/70",
  },
  {
    issue: "Issue 02 · Summer",
    title: "Linen & Light",
    desc: "Breathable cottons and linens for boutique resort lines.",
    tip: "Neutral, sunlit backdrops lift perceived value for everyday fabrics.",
    cover: u("1441984904996-e0b6ba687e04", 1100),
    shots: [u("1483985988355-763728e1935b", 500), u("1469334031218-e382a71b716b", 500), u("1503341504253-dff4815485f1", 500)],
    accent: "from-emerald-500/80 to-cyan-500/70",
  },
  {
    issue: "Issue 03 · Heritage",
    title: "Handloom Stories",
    desc: "Weaves with provenance for the conscious, craft-first designer.",
    tip: "Pair a macro weave shot with the story — craft buyers pay a premium.",
    cover: u("1487222477894-8943e31ef7b2", 1100),
    shots: [u("1515886657613-9f3515b0c78f", 500), u("1524863479829-916d8e77f114", 500), u("1610030469983-98e550d6193c", 500)],
    accent: "from-indigo-500/80 to-fuchsia-500/70",
  },
];

export function Lookbooks() {
  const { notify } = usePipelineDock();
  const [hero, ...rest] = LOOKBOOKS;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold text-ink">Lookbooks & selling ideas</h2>
          <p className="text-ink-soft">Turn your catalogue into shoppable, editorial stories — styled and on-brand.</p>
        </div>
        <button
          onClick={() => notify("Lookbook studio is coming in the next release.", "info")}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-indigo-800"
        >
          <Wand2 size={16} /> Generate lookbook
        </button>
      </div>

      {/* Hero lookbook — magazine cover treatment */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="group relative overflow-hidden rounded-3xl shadow-xl"
      >
        <img src={hero.cover} alt={hero.title} className="h-[380px] w-full object-cover transition duration-700 group-hover:scale-105 sm:h-[440px]" />
        <div className={`absolute inset-0 bg-gradient-to-tr ${hero.accent} mix-blend-multiply`} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:flex-row sm:items-end sm:justify-between sm:p-9">
          <div className="max-w-lg text-cream">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
              <BookOpen size={12} /> {hero.issue}
            </span>
            <h3 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">{hero.title}</h3>
            <p className="mt-2 text-cream/85">{hero.desc}</p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-saffron-300">
              <TrendingUp size={14} /> {hero.tip}
            </p>
          </div>
          <div className="flex gap-2">
            {hero.shots.map((s) => (
              <img key={s} src={s} alt="" className="h-20 w-16 rounded-xl object-cover ring-2 ring-white/40 sm:h-24 sm:w-20" />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Other issues */}
      <div className="grid gap-6 sm:grid-cols-2">
        {rest.map((l, i) => (
          <motion.button
            key={l.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => notify(`"${l.title}" lookbook — coming soon.`, "info")}
            className="group overflow-hidden rounded-3xl border border-black/5 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div className="relative h-56 overflow-hidden">
              <img src={l.cover} alt={l.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
              <div className={`absolute inset-0 bg-gradient-to-tr ${l.accent} opacity-60 mix-blend-multiply`} />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream backdrop-blur">
                {l.issue}
              </span>
              <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                <h3 className="font-display text-2xl font-semibold">{l.title}</h3>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-ink-soft">{l.desc}</p>
              <p className="mt-3 flex items-start gap-1.5 text-sm font-medium text-emerald-700">
                <TrendingUp size={14} className="mt-0.5 shrink-0" /> {l.tip}
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-700 group-hover:gap-2">
                <Sparkles size={14} /> Preview this story <ArrowUpRight size={14} />
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="rounded-3xl border border-dashed border-black/10 bg-cream-deep/40 px-6 py-8 text-center text-ink-soft">
        Full lookbook studio — pick your own products, choose a theme, and get a ready-to-share
        lookbook with AI copy — arrives in the next release.
      </div>
    </div>
  );
}
