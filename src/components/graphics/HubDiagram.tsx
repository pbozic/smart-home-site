/**
 * Original SVG: Home Assistant as the hub, with supported device brands
 * orbiting and connecting to it. Pure SVG, no images — scales crisply.
 */
const NODES = [
  { label: "Shelly", x: 70, y: 60 },
  { label: "Sonoff", x: 290, y: 60 },
  { label: "Aqara", x: 40, y: 180 },
  { label: "Hue", x: 320, y: 180 },
  { label: "Wi-Fi", x: 120, y: 280 },
  { label: "BLE", x: 240, y: 280 },
];

export function HubDiagram({ className = "" }: { className?: string }) {
  const cx = 180;
  const cy = 170;

  return (
    <svg
      viewBox="0 0 360 320"
      className={className}
      role="img"
      aria-label="Home Assistant povezuje naprave Shelly, Sonoff, Aqara in Philips Hue"
    >
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3dd6f5" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3dd6f5" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="hub-core" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3dd6f5" />
          <stop offset="1" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* connection lines */}
      <g stroke="url(#hub-core)" strokeWidth="1.4" opacity="0.45">
        {NODES.map((n) => (
          <line key={n.label} x1={cx} y1={cy} x2={n.x} y2={n.y} />
        ))}
      </g>

      {/* glow */}
      <circle cx={cx} cy={cy} r="74" fill="url(#hub-glow)" />

      {/* hub core */}
      <circle cx={cx} cy={cy} r="46" fill="#0b1020" stroke="url(#hub-core)" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="46" fill="url(#hub-core)" opacity="0.08" />
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        className="fill-white"
        style={{ font: "600 13px var(--font-sans)" }}
      >
        Home
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        className="fill-white"
        style={{ font: "600 13px var(--font-sans)" }}
      >
        Assistant
      </text>

      {/* device nodes */}
      {NODES.map((n) => (
        <g key={n.label}>
          <circle
            cx={n.x}
            cy={n.y}
            r="26"
            fill="#121829"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1"
          />
          <circle cx={n.x} cy={n.y} r="3" fill="#3dd6f5" />
          <text
            x={n.x}
            y={n.y + 4}
            textAnchor="middle"
            className="fill-mist-200"
            style={{ font: "500 10px var(--font-sans)" }}
            dy="14"
          >
            {n.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
