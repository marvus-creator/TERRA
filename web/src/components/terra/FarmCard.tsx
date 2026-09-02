import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowUpRight, Sprout, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import type { Farm, Reading } from '../../types'
import { bandFor, farmHectares, sparkValues, trendOf } from '../../lib/score'
import { cx, fmtHa } from '../../lib/format'
import { BandBadge, SeasonChip, StatusBadge } from '../ui/Badge'
import Sparkline from './Sparkline'

interface Props {
  farm: Farm
  readings?: Reading[]
  highlighted?: boolean
  onHover?: (id: string | null) => void
  compact?: boolean
}

export default function FarmCard({ farm, readings, highlighted = false, onHover, compact = false }: Props) {
  const band = bandFor(farm.score?.terra_score)
  const trend = trendOf(farm)
  const TrendIcon = trend == null ? Minus : trend > 0.08 ? TrendingUp : trend < -0.08 ? TrendingDown : Minus
  return (
    <motion.div layout onMouseEnter={() => onHover?.(farm.id)} onMouseLeave={() => onHover?.(null)}>
      <Link
        to={`/farms/${farm.id}`}
        className={cx(
          'paper group relative block h-full overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-float)]',
          highlighted && 'ring-2 ring-terracotta',
          compact ? 'p-4' : 'p-6',
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1" style={{ background: band ? band.color : '#d8ccb2' }} />
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display truncate text-xl text-olive">{farm.name}</h3>
            <div className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-muted">
              <Sprout size={12} />
              {farm.owner} · {farm.district}
            </div>
          </div>
          <StatusBadge status={farm.status} />
        </div>
        <div className={cx('mt-4 rounded-2xl border border-line bg-cream/60 px-3 pt-2', compact ? 'pb-1' : 'pb-2')}>
          <div className="flex items-center justify-between text-[10px] text-muted">
            <span>NDVI · {readings ? `${readings.length} scenes` : 'loading'}</span>
            <span>2024 → 2026</span>
          </div>
          {readings ? <Sparkline values={sparkValues(readings)} width={280} height={compact ? 36 : 48} className="mt-1 w-full" /> : <div className="skeleton mt-1 h-10 w-full" />}
        </div>
        <div className="mt-4 flex items-end justify-between">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-display text-4xl font-medium tabular-nums" style={{ color: band?.color ?? '#6f6a57' }}>
                {farm.score?.terra_score ?? '—'}
              </span>
              <BandBadge score={farm.score?.terra_score} />
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] text-muted">
              <span>{fmtHa(farmHectares(farm))}</span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <TrendIcon size={12} />
                {farm.score ? `${farm.score.seasons_observed} seasons` : `${farm.seasons.length} seasons`}
              </span>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-medium text-terracotta opacity-0 transition-opacity group-hover:opacity-100">
            Open file <ArrowUpRight size={14} />
          </span>
        </div>
        {!compact && farm.seasons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {farm.seasons.map(s => (
              <SeasonChip key={s.season} season={s.season} peak={s.peak_ndvi} />
            ))}
          </div>
        )}
      </Link>
    </motion.div>
  )
}
