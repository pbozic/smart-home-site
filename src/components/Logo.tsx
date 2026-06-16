import { brand } from "@/lib/brand";

/**
 * Brand logo lockup: an original SVG mark (a stylised home + signal/node)
 * plus the wordmark from `brand.name`. Swapping the brand name in brand.ts
 * updates the wordmark automatically.
 */
export function Logo({ className = "h-8 w-auto" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto"
        role="img"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="sa-logo" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3dd6f5" />
            <stop offset="1" stopColor="#8b5cf6" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="11" fill="url(#sa-logo)" opacity="0.16" />
        {/* House outline */}
        <path
          d="M11 19.5 20 12l9 7.5V29a1 1 0 0 1-1 1h-5v-6h-6v6h-5a1 1 0 0 1-1-1v-9.5z"
          fill="none"
          stroke="url(#sa-logo)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Signal node */}
        <circle cx="20" cy="20.5" r="2.2" fill="#3dd6f5" />
        <path
          d="M16.4 17a5 5 0 0 1 7.2 0M14.2 14.6a8 8 0 0 1 11.6 0"
          fill="none"
          stroke="#8b5cf6"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-display text-lg font-semibold tracking-tight text-white">
        {brand.name}
      </span>
    </span>
  );
}
