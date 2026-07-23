import { Link } from "react-router-dom";

export function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect width="64" height="64" rx="16" fill="#2f2069" />
      <path
        d="M17 19 L32 45 L47 19"
        stroke="#fbb748"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 19 L32 33 L40 19"
        stroke="#faf6ee"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}

export function Logo({ to = "/", dark = false }: { to?: string; dark?: boolean }) {
  const textColor = dark ? "text-ink" : "text-white";
  return (
    <Link to={to} className="flex items-center gap-2.5">
      <LogoMark size={34} />
      <span className={`font-display text-2xl font-semibold tracking-tight ${textColor}`}>
        vastraas
        <span className="text-saffron-500">.ai</span>
      </span>
    </Link>
  );
}
