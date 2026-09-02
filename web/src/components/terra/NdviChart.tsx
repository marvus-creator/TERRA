import { useId, useMemo } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceArea, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts'
import type { Reading } from '../../types'
import { ndviColor, seasonRange, seasonsOf } from '../../lib/score'
import { fmtDate, fmtMonth } from '../../lib/format'

interface Row {
  ts: number
  ndvi: number
  pixels: number
  season: string
  date: string
  quality: number
}

interface Props {
  readings: Reading[]
  activeIndex?: number | null
  height?: number
  onPick?: (index: number) => void
}

function DotShape(props: { cx?: number; cy?: number; payload?: Row; active?: boolean }) {
  const { cx, cy, payload, active } = props
  if (!payload) return <g />
  if (cx == null || cy == null) return <g />
  const clear = payload.quality >= 0.5
  const color = ndviColor(payload.ndvi)
  if (active) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={11} fill="#c4622d" fillOpacity={0.18} />
        <circle cx={cx} cy={cy} r={5.5} fill="#c4622d" stroke="#fcf9f2" strokeWidth={2} />
      </g>
    )
  }
  return clear ? <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#fcf9f2" strokeWidth={1.2} /> : <circle cx={cx} cy={cy} r={3.5} fill="#fcf9f2" stroke={color} strokeWidth={1.6} strokeDasharray="2 1.5" />
}

function TooltipBox({ active, payload }: { active?: boolean; payload?: Array<{ payload: Row }> }) {
  if (!active || !payload?.length) return null
  const row = payload[0].payload
  return (
    <div className="rounded-xl border border-line bg-paper px-3 py-2 text-xs shadow-[var(--shadow-card)]">
      <div className="font-semibold text-olive">{fmtDate(row.date)}</div>
      <div className="mt-1 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: ndviColor(row.ndvi) }} />
        <span className="font-mono">NDVI {row.ndvi.toFixed(3)}</span>
      </div>
      <div className="mt-0.5 text-muted">
        Season {row.season.slice(4)} {row.season.slice(0, 4)} · {row.pixels} clear pixels{row.quality < 0.5 ? ' · partly cloud-masked' : ''}
      </div>
    </div>
  )
}

export default function NdviChart({ readings, activeIndex = null, height = 300, onPick }: Props) {
  const id = useId()
  const data = useMemo<Row[]>(() => {
    const maxPix = Math.max(1, ...readings.map(r => Number(r.pixels)))
    return readings.map(r => ({
      ts: Date.parse(r.date),
      ndvi: Number(r.ndvi_mean),
      pixels: Number(r.pixels),
      season: r.season,
      date: r.date,
      quality: Number(r.pixels) / maxPix,
    }))
  }, [readings])
  const seasons = useMemo(() => seasonsOf(readings), [readings])
  const active = activeIndex != null ? data[activeIndex] : null
  const activeSet = new Set(active ? [active.ts] : [])

  return (
    <div className="h-full w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 16, right: 16, left: -12, bottom: 0 }} onClick={state => {
          const idx = (state as { activeTooltipIndex?: number | string | null })?.activeTooltipIndex
          if (onPick && idx != null && idx !== '') onPick(Number(idx))
        }}>
          <defs>
            <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1c5c30" stopOpacity={0.55} />
              <stop offset="30%" stopColor="#3f8f3a" stopOpacity={0.4} />
              <stop offset="55%" stopColor="#e6c94a" stopOpacity={0.3} />
              <stop offset="80%" stopColor="#c98b3a" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#7a4a1f" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e3d7bd" strokeDasharray="2 5" vertical={false} />
          {seasons.map(s => {
            const [a, b] = seasonRange(s)
            const isA = s.endsWith('A')
            return (
              <ReferenceArea
                key={s}
                x1={a.getTime()}
                x2={b.getTime()}
                ifOverflow="hidden"
                fill={isA ? '#e6c94a' : '#77864f'}
                fillOpacity={isA ? 0.12 : 0.1}
                label={{ value: `Season ${s.slice(4)} ${s.slice(0, 4)}`, position: 'insideTopLeft', fontSize: 10, fill: '#6f6a57' }}
              />
            )
          })}
          <XAxis dataKey="ts" type="number" domain={['dataMin', 'dataMax']} scale="time" tickFormatter={fmtMonth} tick={{ fontSize: 11 }} stroke="#d8ccb2" minTickGap={36} />
          <YAxis domain={[0, 1]} ticks={[0, 0.2, 0.4, 0.6, 0.8, 1]} tick={{ fontSize: 11 }} stroke="#d8ccb2" />
          <Tooltip content={<TooltipBox />} cursor={{ stroke: '#c4622d', strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="ndvi" stroke="none" fill={`url(#${id}-area)`} isAnimationActive animationDuration={1200} />
          <Line type="monotone" dataKey="ndvi" stroke="#2f3a1f" strokeWidth={2} dot={false} activeDot={false} isAnimationActive animationDuration={1600} animationEasing="ease-out" />
          <Scatter dataKey="ndvi" isAnimationActive={false} shape={(p: unknown) => {
              const sp = p as { cx?: number; cy?: number; payload?: Row }
              return <DotShape cx={sp.cx} cy={sp.cy} payload={sp.payload} active={sp.payload ? activeSet.has(sp.payload.ts) : false} />
            }} />
          {active && <ReferenceLine x={active.ts} stroke="#c4622d" strokeWidth={1.5} strokeDasharray="4 3" />}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
