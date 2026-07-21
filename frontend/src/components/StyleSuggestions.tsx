import { Lightbulb, Scissors, TrendingUp } from "lucide-react";

/**
 * "What could this fabric become?" — styling ideas derived from the fabric type,
 * so the designer can imagine finished products and what tends to sell. Purely
 * client-side heuristics; no extra token cost.
 */

interface Idea {
  product: string;
  why: string;
}

const RULES: { match: RegExp; ideas: Idea[] }[] = [
  {
    match: /silk|satin|charmeuse/i,
    ideas: [
      { product: "Draped saree", why: "Silk's fall photographs beautifully — pairs with festive-season demand." },
      { product: "Structured blouse", why: "High-margin add-on; buyers love a matched blouse piece." },
      { product: "Evening gown", why: "Premium occasion-wear commands the highest price per metre." },
      { product: "Scarf / stole", why: "Small cut, quick sell — great for impulse and gifting." },
    ],
  },
  {
    match: /cotton|poplin|cambric|voile/i,
    ideas: [
      { product: "Everyday kurta", why: "Breathable cotton is the year-round bestseller in most catalogues." },
      { product: "Summer shirt", why: "Unisex appeal widens your buyer base." },
      { product: "A-line dress", why: "Simple silhouette, high volume — easy to style on-model." },
      { product: "Co-ord set", why: "Bundling two pieces lifts the average order value." },
    ],
  },
  {
    match: /linen/i,
    ideas: [
      { product: "Relaxed shirt", why: "Linen's premium, breathable reputation supports a higher price." },
      { product: "Wide-leg trousers", why: "On-trend resort/vacation wear that sells through summer." },
      { product: "Co-ord set", why: "Matching sets read as 'designer' and lift order value." },
    ],
  },
  {
    match: /chiffon|georgette|organza/i,
    ideas: [
      { product: "Flowy dupatta", why: "Sheer drape is this fabric's hero shot — light, fast-moving stock." },
      { product: "Layered maxi dress", why: "Movement-rich pieces perform well in on-model video/reels." },
      { product: "Ruffled saree", why: "Contemporary drape appeals to a younger festive buyer." },
    ],
  },
  {
    match: /velvet/i,
    ideas: [
      { product: "Occasion blazer", why: "Velvet outerwear is a statement piece with strong margins." },
      { product: "Festive lehenga", why: "Rich texture signals luxury for the wedding market." },
      { product: "Cushion covers", why: "A home-décor line opens a second, non-apparel revenue stream." },
    ],
  },
  {
    match: /wool|tweed|flannel/i,
    ideas: [
      { product: "Tailored coat", why: "Warm outerwear commands premium winter pricing." },
      { product: "Wrap shawl", why: "Low-effort cut with high perceived value as a gift." },
      { product: "Structured blazer", why: "Workwear staple with steady, non-seasonal demand." },
    ],
  },
  {
    match: /denim/i,
    ideas: [
      { product: "Trucker jacket", why: "Evergreen unisex layer that anchors a denim line." },
      { product: "High-rise jeans", why: "Core volume seller once your fit is dialled in." },
      { product: "A-line skirt", why: "Quick to make, easy to style across seasons." },
    ],
  },
  {
    match: /brocade|banarasi|zari|jacquard/i,
    ideas: [
      { product: "Festive lehenga", why: "Ornate weave is built for the high-value wedding market." },
      { product: "Statement jacket", why: "Fusion pieces sell to a modern, event-going buyer." },
      { product: "Clutch / potli", why: "Off-cut accessories turn waste into extra margin." },
    ],
  },
  {
    match: /chanderi|handloom|khadi|ikat|block/i,
    ideas: [
      { product: "Heritage saree", why: "Handloom stories justify a craft premium and repeat buyers." },
      { product: "Straight kurta", why: "Lets the weave speak — clean, minimal, high-appeal." },
      { product: "Dupatta", why: "Fast-selling accessory that showcases the print." },
    ],
  },
];

const DEFAULT_IDEAS: Idea[] = [
  { product: "Signature kurta", why: "A clean silhouette lets the fabric's colour and weave lead." },
  { product: "Statement dress", why: "On-model dress shots convert best on social and product pages." },
  { product: "Matched accessory", why: "A scarf or dupatta from off-cuts adds margin with little effort." },
];

export function suggestionsFor(fabricType?: string | null, tags: string[] = []): Idea[] {
  const hay = `${fabricType ?? ""} ${tags.join(" ")}`;
  const hit = RULES.find((r) => r.match.test(hay));
  return (hit?.ideas ?? DEFAULT_IDEAS).slice(0, 4);
}

export function StyleSuggestions({
  fabricType,
  tags = [],
}: {
  fabricType?: string | null;
  tags?: string[];
}) {
  const ideas = suggestionsFor(fabricType, tags);
  return (
    <div className="rounded-3xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-cream-deep/30 p-5 sm:p-6">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="inline-flex rounded-xl bg-indigo-100 p-2 text-indigo-700">
          <Lightbulb size={18} />
        </span>
        <div>
          <h4 className="font-display text-lg font-semibold text-ink">Ways to sell this fabric</h4>
          <p className="text-xs text-ink-soft">Product ideas suited to this cloth — imagine it, then generate the shot.</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {ideas.map((idea) => (
          <li key={idea.product} className="flex gap-3 rounded-2xl border border-black/5 bg-white p-3.5 shadow-sm">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-saffron-300/40 text-saffron-600">
              <Scissors size={14} />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-ink">{idea.product}</p>
              <p className="flex items-start gap-1 text-sm text-ink-soft">
                <TrendingUp size={13} className="mt-1 shrink-0 text-emerald-600" />
                {idea.why}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
