/**
 * Original SVG "app" mockup — a phone showing a smart-home dashboard with
 * room tiles, a lighting toggle and an energy chart. Sells the "one app for
 * everything" message without a real screenshot.
 */
export function PhoneMockup({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 280 560"
      className={className}
      role="img"
      aria-label="Pametni dom v eni aplikaciji — nadzorna plošča"
    >
      <defs>
        <linearGradient id="ph-screen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1020" />
          <stop offset="1" stopColor="#121829" />
        </linearGradient>
        <linearGradient id="ph-accent" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#3dd6f5" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* device body */}
      <rect x="8" y="8" width="264" height="544" rx="42" fill="#05070d" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
      <rect x="18" y="18" width="244" height="524" rx="34" fill="url(#ph-screen)" />

      {/* status bar */}
      <text x="40" y="52" className="fill-white" style={{ font: "600 13px var(--font-sans)" }}>
        Moj dom
      </text>
      <circle cx="236" cy="47" r="10" fill="url(#ph-accent)" opacity="0.25" />
      <circle cx="236" cy="47" r="3.5" fill="#3dd6f5" />

      {/* greeting card */}
      <rect x="32" y="70" width="216" height="76" rx="18" fill="url(#ph-accent)" opacity="0.14" />
      <text x="48" y="100" className="fill-white" style={{ font: "600 15px var(--font-sans)" }}>
        Dober večer
      </text>
      <text x="48" y="122" className="fill-mist-300" style={{ font: "400 11px var(--font-sans)" }}>
        21 °C · 3 luči prižgane
      </text>

      {/* room tiles */}
      {[
        { x: 32, y: 162, t: "Dnevna soba", s: "2 napravi" },
        { x: 144, y: 162, t: "Kuhinja", s: "1 naprava" },
        { x: 32, y: 250, t: "Spalnica", s: "Ugasnjeno" },
        { x: 144, y: 250, t: "Vhod", s: "Zaklenjeno" },
      ].map((tile) => (
        <g key={tile.t}>
          <rect x={tile.x} y={tile.y} width="104" height="78" rx="16" fill="#1b2238" stroke="rgba(255,255,255,0.06)" />
          <circle cx={tile.x + 22} cy={tile.y + 26} r="9" fill="url(#ph-accent)" opacity="0.3" />
          <circle cx={tile.x + 22} cy={tile.y + 26} r="3" fill="#3dd6f5" />
          <text x={tile.x + 16} y={tile.y + 54} className="fill-white" style={{ font: "600 11px var(--font-sans)" }}>
            {tile.t}
          </text>
          <text x={tile.x + 16} y={tile.y + 69} className="fill-mist-400" style={{ font: "400 9px var(--font-sans)" }}>
            {tile.s}
          </text>
        </g>
      ))}

      {/* lighting slider */}
      <rect x="32" y="346" width="216" height="58" rx="16" fill="#1b2238" stroke="rgba(255,255,255,0.06)" />
      <text x="48" y="372" className="fill-white" style={{ font: "600 11px var(--font-sans)" }}>
        Osvetlitev
      </text>
      <rect x="48" y="382" width="184" height="6" rx="3" fill="#28304a" />
      <rect x="48" y="382" width="120" height="6" rx="3" fill="url(#ph-accent)" />
      <circle cx="168" cy="385" r="8" fill="#3dd6f5" />

      {/* energy chart */}
      <rect x="32" y="418" width="216" height="96" rx="16" fill="#1b2238" stroke="rgba(255,255,255,0.06)" />
      <text x="48" y="444" className="fill-white" style={{ font: "600 11px var(--font-sans)" }}>
        Poraba danes
      </text>
      <g fill="url(#ph-accent)">
        {[20, 34, 26, 44, 30, 52, 40].map((h, i) => (
          <rect key={i} x={48 + i * 27} y={500 - h} width="14" height={h} rx="3" opacity={0.5 + (i % 3) * 0.2} />
        ))}
      </g>
    </svg>
  );
}
