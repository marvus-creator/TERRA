import type { ReactNode } from 'react'
import { cx } from '../../lib/format'
import type { FarmStatus } from '../../types'
import { STATUS_LABEL, bandFor } from '../../lib/score'

type Tone = 'olive' | 'sand' | 'terracotta' | 'sky' | 'amber' | 'red' | 'green' | 'ink'

const tones: Record<Tone, string> = {
  olive: 'bg-olive/10 text-olive border-olive/15',
  sand: 'bg-sand text-muted border-line',
  terracotta: 'bg-terracotta-soft text-terracotta border-terracotta/20',
  sky: 'bg-[#dfe8ef] text-[#2b5b78] border-[#2b5b78]/15',
  amber: 'bg-[#f6efc9] text-[#7a5b12] border-[#7a5b12]/15',
  red: 'bg-[#f6dcd6] text-[#8b2e1f] border-[#8b2e1f]/15',
  green: 'bg-[#d3e6d6] text-[#1c5c30] border-[#1c5c30]/15',
  ink: 'bg-ink text-cream border-ink',
}

export function Badge({ tone = 'sand', className, children, dot }: { tone?: Tone; className?: string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}

const statusTone: Record<FarmStatus, Tone> = {
  scored: 'green',
  analyzing: 'sky',
  insufficient_data: 'amber',
  failed: 'red',
}

export function StatusBadge({ status, className }: { status: FarmStatus; className?: string }) {
  return (
    <Badge tone={statusTone[status]} className={cx(status === 'analyzing' && 'animate-pulse', className)} dot>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function BandBadge({ score, className }: { score: number | null | undefined; className?: string }) {
  const band = bandFor(score)
  if (!band) return <Badge className={className}>Unscored</Badge>
  return (
    <span
      className={cx('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide', className)}
      style={{ background: band.soft, color: band.color, borderColor: `${band.color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: band.color }} />
      {band.label}
    </span>
  )
}

export function SeasonChip({ season, peak }: { season: string; peak?: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md border border-line bg-paper px-1.5 py-0.5 font-mono text-[10px] text-olive">
      {season}
      {peak != null && <span className="text-muted">{peak.toFixed(2)}</span>}
    </span>
  )
}
