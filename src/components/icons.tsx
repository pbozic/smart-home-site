/**
 * Lightweight inline SVG icons (stroke-based, currentColor).
 * Keeps the bundle tiny — no icon library dependency.
 */
import type { JSX, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (p: IconProps) => ({
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...p,
});

export const Shield = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

export const Bolt = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z" />
  </svg>
);

export const Sliders = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
);

export const Sparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="M12 7c.6 2.4 2.6 4.4 5 5-2.4.6-4.4 2.6-5 5-.6-2.4-2.6-4.4-5-5 2.4-.6 4.4-2.6 5-5z" />
  </svg>
);

export const Check = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);

export const Cross = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const ArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Menu = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

export const Phone = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 5 5L19 13l2 5v3a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1z" />
  </svg>
);

export const Mail = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const icons = { Shield, Bolt, Sliders, Sparkles } as const;
export type IconName = keyof typeof icons;

/** Render an icon by its lowercase content key (matches home.ts `icon` field). */
export function FeatureIcon({ name, ...p }: { name: string } & IconProps) {
  const map: Record<string, (props: IconProps) => JSX.Element> = {
    shield: Shield,
    bolt: Bolt,
    sliders: Sliders,
    sparkles: Sparkles,
  };
  const Cmp = map[name] ?? Sparkles;
  return <Cmp {...p} />;
}
