import { useEffect, useState } from 'react'
import { animate } from 'motion/react'
import { BANDS, bandFor } from '../../lib/score'
import { cx } from '../../lib/format'

const MIN = 300
const MAX = 850
const R = 96
const CX = 120
const CY = 118

function polar(angle: number, r = R) {
  const rad = (Math.PI * (180 - angle)) / 180
  return [CX + r * Math.cos(rad), CY - r * Math.sin(rad)]
}

function arc(from: number, to: number, r = R) {
  const [x1, y1] = polar(from, r)
  const [x2, y2] = polar(to, r)
  const large = to - from > 180 ? 1 : 0
  return `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large} 1 ${x2.toFixed(2)},${y2.toFixed(2)}`
}

const toAngle = (score: number) => ((score - MIN) / (MAX - MIN)) * 180

interface Props {
  score: number | null
  label?: string
  size?: 'md' | 'lg'
  className?: string
  animateIn?: boolean
}

export default function ScoreGauge({ score, label = 'TERRA Score', size = 'lg', className, animateIn = true }: Props) {
  const [value, setValue] = useState(animateIn ? MIN : (score ?? MIN))
  useEffect(() => {
    if (score == null) return
    const controls = animate(MIN, score, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: v => setValue(v),
    })
    return () => controls.stop()
  }, [score])
  const band = bandFor(score)
  const liveBand = bandFor(Math.round(value))
  const angle = toAngle(value)
  const [nx, ny] = polar(angle, R - 18)
  return (
    <div className={cx('relative', className)} data-tour="gauge">
      <svg viewBox="-16 0 272 140" className={cx('w-full', size === 'lg' ? 'max-w-[320px]' : 'max-w-[200px]')}>
        {BANDS.map(b => (
          <path key={b.key} d={arc(toAngle(b.min), toAngle(b.max + 1))} stroke={b.color} strokeOpacity={0.22} strokeWidth={14} fill="none" strokeLinecap="butt" />
        ))}
        {score != null && <path d={arc(0, Math.max(0.5, angle))} stroke={liveBand?.color ?? '#c98b3a'} strokeWidth={14} fill="none" strokeLinecap="round" style={{ transition: 'stroke 0.3s' }} />}
        {[300, 640, 700, 760, 850].map(t => {
          const [x1, y1] = polar(toAngle(t), R + 11)
          const [x2, y2] = polar(toAngle(t), R + 15)
          const [tx, ty] = polar(toAngle(t), R + 26)
          return (
            <g key={t}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#6f6a57" strokeWidth={1} />
              <text x={tx} y={ty + 3} fontSize={8} textAnchor="middle" fill="#6f6a57" fontFamily="Inter, sans-serif">
                {t}
              </text>
            </g>
          )
        })}
        {score != null && <circle cx={nx} cy={ny} r={4} fill={liveBand?.color ?? '#c98b3a'} stroke="#fcf9f2" strokeWidth={2} />}
        <text x={CX} y={CY - 6} textAnchor="middle" fontSize={size === 'lg' ? 46 : 34} fontWeight={500} fill="#2f3a1f" fontFamily="Fraunces, Georgia, serif">
          {score == null ? '—' : Math.round(value)}
        </text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize={8} letterSpacing={2} fill="#77864f" fontFamily="Inter, sans-serif" fontWeight={600}>
          {label.toUpperCase()} · 300–850
        </text>
      </svg>
      {band && (
        <div className="mt-1 flex items-center justify-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ background: band.color }} />
          <span className="text-sm font-semibold" style={{ color: band.color }}>
            {band.label}
          </span>
          <span className="text-xs text-muted">
            {band.min}–{band.max}
          </span>
        </div>
      )}
    </div>
  )
}
