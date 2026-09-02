import { cx } from '../../lib/format'

const CELLS = [
  0.32, 0.41, 0.55, 0.62, 0.7, 0.74, 0.72, 0.66, 0.38, 0.5, 0.6, 0.71, 0.78, 0.8, 0.77, 0.7, 0.45, 0.58, 0.69, 0.76, 0.83, 0.85, 0.8, 0.73, 0.5, 0.63, 0.74, 0.8, 0.86, 0.87, 0.84, 0.76, 0.52, 0.66, 0.75, 0.82, 0.85, 0.86, 0.8, 0.72, 0.48, 0.6, 0.7, 0.76, 0.8, 0.78, 0.73, 0.6,
]

function cellColor(v: number) {
  const stops: [number, number, number, number][] = [
    [0, 122, 74, 31],
    [0.22, 201, 139, 58],
    [0.45, 230, 201, 74],
    [0.65, 156, 191, 58],
    [0.84, 63, 143, 58],
    [1, 28, 92, 48],
  ]
  for (let i = 1; i < stops.length; i++) {
    if (v <= stops[i][0]) {
      const a = stops[i - 1]
      const b = stops[i]
      const k = (v - a[0]) / (b[0] - a[0])
      return `rgb(${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)},${Math.round(a[3] + (b[3] - a[3]) * k)})`
    }
  }
  return '#1c5c30'
}

export default function OrbitArt({ className, label = 'Mukamana Family Plot', ndvi = 0.83, date = '30 Jun 2026' }: { className?: string; label?: string; ndvi?: number; date?: string }) {
  const cols = 8
  const rows = 6
  const cell = 34
  const originX = 150
  const originY = 150
  return (
    <div className={cx('relative', className)}>
      <svg viewBox="0 0 560 460" className="w-full drop-shadow-[0_30px_40px_rgba(47,58,31,0.18)]">
        <defs>
          <clipPath id="field-clip">
            <path d={`M${originX + 4},${originY + 20} L${originX + cols * cell - 30},${originY - 6} L${originX + cols * cell + 6},${originY + rows * cell - 40} L${originX + 30},${originY + rows * cell + 8} Z`} />
          </clipPath>
          <linearGradient id="scan-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fcf9f2" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fcf9f2" stopOpacity="0.85" />
            <stop offset="1" stopColor="#fcf9f2" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#e6c94a" stopOpacity="0.45" />
            <stop offset="1" stopColor="#e6c94a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="280" cy="250" rx="250" ry="140" fill="url(#glow)" />
        <g transform="translate(120 100) skewX(-6)">
          <rect x="-40" y="-40" width="420" height="330" rx="18" fill="#fcf9f2" stroke="#d8ccb2" />
          <text x="-16" y="-14" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="13" fill="#6f6a57">
            field notebook · Bugesera
          </text>
          <line x1="-40" y1="-4" x2="380" y2="-4" stroke="#d8ccb2" />
        </g>
        <g clipPath="url(#field-clip)">
          {CELLS.map((v, i) => {
            const c = i % cols
            const r = Math.floor(i / cols)
            return (
              <rect key={i} x={originX + c * cell} y={originY + r * cell} width={cell} height={cell} fill={cellColor(v)} stroke="#f7f1e5" strokeOpacity="0.35" strokeWidth="1">
                <animate attributeName="opacity" values="0.75;1;0.75" dur={`${5 + (i % 5)}s`} repeatCount="indefinite" />
              </rect>
            )
          })}
          <rect x={originX - 20} y={originY - 60} width={cols * cell + 60} height="60" fill="url(#scan-grad)">
            <animate attributeName="y" values={`${originY - 70};${originY + rows * cell + 10};${originY - 70}`} dur="6s" repeatCount="indefinite" keyTimes="0;0.55;1" calcMode="spline" keySplines="0.22 1 0.36 1;0 0 1 1" />
          </rect>
        </g>
        <path d={`M${originX + 4},${originY + 20} L${originX + cols * cell - 30},${originY - 6} L${originX + cols * cell + 6},${originY + rows * cell - 40} L${originX + 30},${originY + rows * cell + 8} Z`} fill="none" stroke="#fcf9f2" strokeWidth="3" />
        <path d={`M${originX + 4},${originY + 20} L${originX + cols * cell - 30},${originY - 6} L${originX + cols * cell + 6},${originY + rows * cell - 40} L${originX + 30},${originY + rows * cell + 8} Z`} fill="none" stroke="#c4622d" strokeWidth="1.5" strokeDasharray="6 5">
          <animate attributeName="stroke-dashoffset" from="0" to="-44" dur="3s" repeatCount="indefinite" />
        </path>
        <path id="orbit-path" d="M40,120 C120,-20 460,-20 530,140 C560,240 420,330 300,300 C160,270 0,220 40,120 Z" fill="none" stroke="#2f3a1f" strokeOpacity="0.35" strokeWidth="1.2" strokeDasharray="4 6" />
        <g>
          <animateMotion dur="16s" repeatCount="indefinite" rotate="auto">
            <mpath href="#orbit-path" />
          </animateMotion>
          <rect x="-26" y="-5" width="18" height="10" rx="2" fill="#4b5a2e" stroke="#f7f1e5" strokeWidth="1" />
          <rect x="8" y="-5" width="18" height="10" rx="2" fill="#4b5a2e" stroke="#f7f1e5" strokeWidth="1" />
          <rect x="-7" y="-7" width="14" height="14" rx="3" fill="#2f3a1f" stroke="#f7f1e5" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="2.5" fill="#e6c94a" />
          <circle cx="0" cy="0" r="14" fill="none" stroke="#c4622d" strokeWidth="1.2" opacity="0.7">
            <animate attributeName="r" values="6;20" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
        <g transform="translate(300 392)">
          <rect x="-118" y="-22" width="236" height="44" rx="22" fill="#2f3a1f" />
          <circle cx="-96" cy="0" r="7" fill={cellColor(ndvi)} stroke="#f7f1e5" strokeWidth="1.5" />
          <text x="-80" y="-3" fontSize="11" fontWeight="600" fill="#f7f1e5" fontFamily="Inter, sans-serif">
            {label}
          </text>
          <text x="-80" y="12" fontSize="10" fill="#f7f1e5" fillOpacity="0.7" fontFamily="Inter, sans-serif">
            NDVI {ndvi.toFixed(2)} · latest clear scene {date}
          </text>
        </g>
        <g transform="translate(455 300)" fontFamily="Fraunces, Georgia, serif" fontStyle="italic" fontSize="13" fill="#6f6a57">
          <text>10 m pixels,</text>
          <text y="16">every 5 days</text>
          <path d="M-6,4 C-40,-10 -60,0 -70,-30" stroke="#6f6a57" fill="none" strokeWidth="1" strokeDasharray="2 3" />
        </g>
      </svg>
    </div>
  )
}
