import { useId } from 'react'

interface Props {
  values: number[]
  width?: number
  height?: number
  className?: string
  strokeWidth?: number
  animate?: boolean
  highlight?: number | null
}

export default function Sparkline({ values, width = 160, height = 44, className, strokeWidth = 1.8, animate = true, highlight = null }: Props) {
  const id = useId()
  if (values.length < 2) {
    return (
      <svg width={width} height={height} className={className}>
        <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="#d8ccb2" strokeDasharray="3 3" />
      </svg>
    )
  }
  const pad = 3
  const xs = values.map((_, i) => pad + (i / (values.length - 1)) * (width - pad * 2))
  const ys = values.map(v => height - pad - Math.max(0, Math.min(1, v)) * (height - pad * 2))
  const path = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ')
  const area = `${path} L${xs[xs.length - 1].toFixed(1)},${height - pad} L${xs[0].toFixed(1)},${height - pad} Z`
  const length = xs.reduce((acc, x, i) => (i === 0 ? 0 : acc + Math.hypot(x - xs[i - 1], ys[i] - ys[i - 1])), 0)
  return (
    <svg width={width} height={height} className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`${id}-stroke`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#7a4a1f" />
          <stop offset="0.35" stopColor="#c98b3a" />
          <stop offset="0.55" stopColor="#e6c94a" />
          <stop offset="0.75" stopColor="#9cbf3a" />
          <stop offset="1" stopColor="#1c5c30" />
        </linearGradient>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3f8f3a" stopOpacity="0.28" />
          <stop offset="1" stopColor="#e6c94a" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id}-fill)`} />
      <path
        d={path}
        fill="none"
        stroke={`url(#${id}-stroke)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={animate ? { strokeDasharray: length, strokeDashoffset: length, animation: 'draw 1.4s var(--ease-organic) forwards' } : undefined}
      />
      {highlight != null && highlight >= 0 && highlight < xs.length && (
        <circle cx={xs[highlight]} cy={ys[highlight]} r={3.5} fill="#c4622d" stroke="#fcf9f2" strokeWidth={1.5} />
      )}
    </svg>
  )
}
