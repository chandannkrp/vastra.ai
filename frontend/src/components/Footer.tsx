import { LogoMark } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-cream-deep">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <LogoMark size={26} />
          <span className="font-display text-lg font-semibold text-ink">
            vastraas<span className="text-saffron-500">.ai</span>
          </span>
        </div>
        <p className="text-sm text-ink-soft">
          AI storefront for fabric sellers · Built for Indian designers &amp; garmenters
        </p>
        <p className="text-xs text-ink-soft/70">
          © {new Date().getFullYear()} vastraas.ai
        </p>
      </div>
    </footer>
  );
}
