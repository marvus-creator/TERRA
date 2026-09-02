import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, ChevronDown, ChevronUp, GitCompareArrows, Landmark, Minus, TrendingDown, TrendingUp, X } from 'lucide-react'
import CompareDrawer from '../components/terra/CompareDrawer'
import Sparkline from '../components/terra/Sparkline'
import { BandBadge, Button, Card, EmptyState, PageHeader, RowSkeleton, Stat, StatusBadge, useToast } from '../components/ui'
import { useAllSeries, useFarms, useStats } from '../hooks/useData'
import { BANDS, bandFor, farmHectares, sparkValues, trendOf, trendWord } from '../lib/score'
import { cx, fmtHa, pct } from '../lib/format'
import type { Farm } from '../types'

type Col = 'name' | 'score' | 'hectares' | 'trend' | 'seasons' | 'consistency'

const getters: Record<Col, (f: Farm) => number | string> = {
  name: f => f.name.toLowerCase(),
  score: f => f.score?.terra_score ?? -1,
  hectares: f => farmHectares(f),
  trend: f => trendOf(f) ?? -9,
  seasons: f => f.score?.seasons_observed ?? f.seasons.length,
  consistency: f => f.score?.consistency_component ?? -1,
}

export default function Lender() {
  const { farms, loading } = useFarms()
  const series = useAllSeries()
  const stats = useStats()
  const { toast } = useToast()
  const [col, setCol] = useState<Col>('score')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')
  const [picked, setPicked] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  const rows = useMemo(() => {
    const list = (farms ?? []).slice()
    const g = getters[col]
    list.sort((a, b) => {
      const x = g(a)
      const y = g(b)
      const r = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y))
      return dir === 'asc' ? r : -r
    })
    return list
  }, [farms, col, dir])

  const distribution = useMemo(() => BANDS.map(b => ({ band: b, n: (farms ?? []).filter(f => bandFor(f.score?.terra_score)?.key === b.key).length })), [farms])
  const pickedFarms = picked.map(id => (farms ?? []).find(f => f.id === id)).filter((f): f is Farm => !!f)

  function toggle(id: string) {
    setPicked(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 3) {
        toast('Compare up to three farms at once', 'info')
        return prev
      }
      return [...prev, id]
    })
  }

  function sortBy(c: Col) {
    if (c === col) setDir(d => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setCol(c)
      setDir(c === 'name' ? 'asc' : 'desc')
    }
  }

  const Th = ({ c, label, className }: { c: Col; label: string; className?: string }) => (
    <th className={cx('py-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted', className)}>
      <button onClick={() => sortBy(c)} className={cx('focus-ring inline-flex items-center gap-1 rounded-md hover:text-olive', col === c && 'text-olive')}>
        {label}
        {col === c ? dir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} /> : <span className="w-3" />}
      </button>
    </th>
  )

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader
        overline="Lender view"
        title="The portfolio, ready for a loan committee."
        lede="Sort by what matters to you, tick two or three farms, and compare them side by side. Every number traces back to public satellite imagery."
        aside={
          <span className="flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-xs text-muted">
            <Landmark size={14} /> Transparent heuristic v1 · not yet calibrated to repayment data
          </span>
        }
      />

      <div className="grid gap-5 md:grid-cols-[1fr_1fr_1fr_1.4fr]">
        <Card>
          <Stat label="Scored farms" value={stats?.scored} hint={stats ? `of ${stats.farms} registered` : undefined} />
        </Card>
        <Card>
          <Stat label="Portfolio average" value={stats?.average_score} hint={stats?.average_score ? bandFor(stats.average_score)?.label : undefined} />
        </Card>
        <Card>
          <Stat label="Hectares" value={stats?.hectares} decimals={1} hint="under satellite watch" />
        </Card>
        <Card>
          <div className="overline">Score bands</div>
          <div className="mt-3 flex h-3 w-full overflow-hidden rounded-full bg-sand">
            {distribution.map(d => (
              <div key={d.band.key} style={{ width: `${(d.n / Math.max(1, (farms ?? []).length)) * 100}%`, background: d.band.color }} className="transition-all" />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
            {distribution.map(d => (
              <span key={d.band.key} className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full" style={{ background: d.band.color }} /> {d.band.label} {d.n}
              </span>
            ))}
          </div>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0" data-tour="lender-table">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-sand/60">
              <tr>
                <th className="w-10 py-3 pl-4" />
                <Th c="name" label="Farm" />
                <th className="py-3 pr-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">NDVI history</th>
                <Th c="score" label="Score" />
                <Th c="hectares" label="Hectares" />
                <Th c="trend" label="Trend" />
                <Th c="consistency" label="Consistency" />
                <Th c="seasons" label="Seasons" />
                <th className="py-3 pr-4 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Status</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {loading && [0, 1, 2, 3].map(i => (
                <tr key={i}>
                  <td colSpan={10} className="p-0">
                    <RowSkeleton />
                  </td>
                </tr>
              ))}
              {rows.map(f => {
                const band = bandFor(f.score?.terra_score)
                const trend = trendOf(f)
                const TrendIcon = trend == null ? Minus : trend > 0.08 ? TrendingUp : trend < -0.08 ? TrendingDown : Minus
                const checked = picked.includes(f.id)
                return (
                  <tr key={f.id} className={cx('border-t border-line transition-colors', checked ? 'bg-terracotta-soft/50' : 'hover:bg-cream/70')}>
                    <td className="py-3 pl-4">
                      <input type="checkbox" checked={checked} onChange={() => toggle(f.id)} aria-label={`Select ${f.name}`} className="h-4 w-4" />
                    </td>
                    <td className="py-3 pr-3">
                      <Link to={`/farms/${f.id}`} className="font-medium text-olive hover:text-terracotta">
                        {f.name}
                      </Link>
                      <div className="text-xs text-muted">
                        {f.owner} · {f.district}
                      </div>
                    </td>
                    <td className="py-3 pr-3">{series ? <Sparkline values={sparkValues(series[f.id] ?? [])} width={120} height={32} animate={false} /> : <div className="skeleton h-8 w-[120px]" />}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-2xl" style={{ color: band?.color ?? '#6f6a57' }}>
                          {f.score?.terra_score ?? '—'}
                        </span>
                        <BandBadge score={f.score?.terra_score} />
                      </div>
                    </td>
                    <td className="py-3 pr-3 font-mono">{fmtHa(farmHectares(f))}</td>
                    <td className="py-3 pr-3">
                      <span className={cx('inline-flex items-center gap-1.5', trend != null && trend > 0.08 ? 'text-ndvi-5' : trend != null && trend < -0.08 ? 'text-terracotta' : 'text-muted')}>
                        <TrendIcon size={14} /> {trendWord(trend)}
                        {f.score && <span className="font-mono text-xs text-muted">{pct(f.score.trend_component)}</span>}
                      </span>
                    </td>
                    <td className="py-3 pr-3">
                      {f.score ? (
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-sand">
                            <div className="h-full rounded-full bg-ndvi-3" style={{ width: `${f.score.consistency_component * 100}%` }} />
                          </div>
                          <span className="font-mono text-xs">{pct(f.score.consistency_component)}</span>
                        </div>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 pr-3 font-mono">{f.score?.seasons_observed ?? f.seasons.length}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={f.status} />
                    </td>
                    <td className="py-3 pr-4">
                      <Link to={`/farms/${f.id}`} className="text-muted hover:text-terracotta" aria-label="Open credit file">
                        <ArrowUpRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {!loading && rows.length === 0 && (
          <div className="p-6">
            <EmptyState title="No farms in the portfolio yet" body="Register a field and it will appear here as soon as the satellite has read it." action={<Button to="/register" variant="accent">Register a farm</Button>} />
          </div>
        )}
      </Card>

      <AnimatePresence>
        {picked.length > 0 && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className="fixed bottom-6 left-1/2 z-[1200] flex -translate-x-1/2 items-center gap-3 rounded-full border border-line bg-olive px-4 py-2.5 text-cream shadow-[var(--shadow-float)]">
            <span className="text-sm">
              {picked.length} selected
              <span className="ml-2 text-cream/60">{pickedFarms.map(f => f.name.split(' ')[0]).join(' · ')}</span>
            </span>
            <button onClick={() => setOpen(true)} disabled={picked.length < 2} className="focus-ring inline-flex h-8 items-center gap-1.5 rounded-full bg-terracotta px-3.5 text-xs font-semibold text-cream hover:bg-terracotta-2 disabled:opacity-50" data-tour="compare">
              <GitCompareArrows size={14} /> Compare {picked.length < 2 ? '(pick 2+)' : ''}
            </button>
            <button onClick={() => setPicked([])} className="focus-ring rounded-full p-1.5 text-cream/70 hover:bg-cream/10 hover:text-cream" aria-label="Clear selection">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CompareDrawer open={open} onClose={() => setOpen(false)} farms={pickedFarms} series={series} />
    </div>
  )
}
