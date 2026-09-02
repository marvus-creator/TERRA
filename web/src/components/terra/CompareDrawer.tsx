import { Link } from 'react-router-dom'
import type { Farm, Reading } from '../../types'
import { bandFor, farmHectares, sparkValues, trendOf, trendWord } from '../../lib/score'
import { cx, fmtHa, pct } from '../../lib/format'
import Modal from '../ui/Modal'
import { BandBadge, StatusBadge } from '../ui/Badge'
import Sparkline from './Sparkline'
import Button from '../ui/Button'

interface Props {
  open: boolean
  onClose: () => void
  farms: Farm[]
  series: Record<string, Reading[]> | null
}

function best(values: Array<number | null>) {
  const nums = values.filter((v): v is number => v != null)
  if (!nums.length) return null
  return Math.max(...nums)
}

export default function CompareDrawer({ open, onClose, farms, series }: Props) {
  const scores = farms.map(f => f.score?.terra_score ?? null)
  const has = farms.map(f => farmHectares(f))
  const trends = farms.map(f => trendOf(f))
  const bestScore = best(scores)
  const bestHa = best(has)
  const bestTrend = best(trends)
  const rows: Array<{ label: string; cells: Array<{ text: string; win?: boolean }> }> = [
    { label: 'TERRA Score', cells: farms.map((f, i) => ({ text: f.score ? String(f.score.terra_score) : '—', win: scores[i] != null && scores[i] === bestScore })) },
    { label: 'Band', cells: farms.map(f => ({ text: bandFor(f.score?.terra_score)?.label ?? 'Unscored' })) },
    { label: 'Field size', cells: farms.map((_, i) => ({ text: fmtHa(has[i]), win: has[i] === bestHa })) },
    { label: 'Seasons observed', cells: farms.map(f => ({ text: String(f.score?.seasons_observed ?? f.seasons.length) })) },
    { label: 'Productivity', cells: farms.map(f => ({ text: f.score ? pct(f.score.peak_component) : '—' })) },
    { label: 'Consistency', cells: farms.map(f => ({ text: f.score ? pct(f.score.consistency_component) : '—' })) },
    { label: 'Trend', cells: farms.map((f, i) => ({ text: f.score ? `${trendWord(trends[i])} (${pct(f.score.trend_component)})` : '—', win: trends[i] != null && trends[i] === bestTrend })) },
    { label: 'Best season peak', cells: farms.map(f => ({ text: f.seasons.length ? Math.max(...f.seasons.map(s => s.peak_ndvi)).toFixed(3) : '—' })) },
    { label: 'Satellite scenes', cells: farms.map(f => ({ text: series ? String(series[f.id]?.length ?? 0) : '…' })) },
    { label: 'Verdict', cells: farms.map(f => ({ text: bandFor(f.score?.terra_score)?.verdict ?? 'Not enough clean seasons yet.' })) },
  ]
  return (
    <Modal open={open} onClose={onClose} title={`Compare ${farms.length} farms`} side>
      <div className="p-6">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${farms.length}, minmax(0, 1fr))` }}>
          {farms.map(f => {
            const band = bandFor(f.score?.terra_score)
            return (
              <div key={f.id} className="rounded-2xl border border-line bg-cream/60 p-4">
                <div className="h-1 w-12 rounded-full" style={{ background: band?.color ?? '#d8ccb2' }} />
                <h3 className="font-display mt-2 truncate text-lg text-olive">{f.name}</h3>
                <div className="truncate text-xs text-muted">{f.owner}</div>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="font-display text-4xl" style={{ color: band?.color ?? '#6f6a57' }}>
                    {f.score?.terra_score ?? '—'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <BandBadge score={f.score?.terra_score} />
                  <StatusBadge status={f.status} />
                </div>
                <div className="mt-3">{series ? <Sparkline values={sparkValues(series[f.id] ?? [])} width={220} height={44} className="w-full" /> : <div className="skeleton h-11 w-full" />}</div>
              </div>
            )
          })}
        </div>
        <table className="mt-6 w-full text-sm">
          <tbody>
            {rows.map(row => (
              <tr key={row.label} className="border-t border-line">
                <th className="w-36 py-3 pr-3 text-left align-top text-[11px] font-semibold uppercase tracking-wider text-muted">{row.label}</th>
                {row.cells.map((c, i) => (
                  <td key={i} className={cx('py-3 pr-3 align-top', c.win ? 'font-semibold text-ndvi-5' : 'text-ink')}>
                    {c.text}
                    {c.win && <span className="ml-1.5 rounded-full bg-[#d3e6d6] px-1.5 text-[10px] text-ndvi-5">best</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-6 flex flex-wrap gap-2">
          {farms.map(f => (
            <Link key={f.id} to={`/farms/${f.id}`} onClick={onClose}>
              <Button variant="secondary" size="sm">
                Open {f.name.split(' ')[0]} file
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </Modal>
  )
}
