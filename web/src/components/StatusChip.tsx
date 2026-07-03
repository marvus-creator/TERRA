import type { FarmStatus } from '../types'

const styles: Record<FarmStatus, string> = {
  scored: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
  analyzing: 'animate-pulse border-sky-400/30 bg-sky-400/15 text-sky-300',
  insufficient_data: 'border-amber-400/30 bg-amber-400/15 text-amber-300',
  failed: 'border-red-400/30 bg-red-400/15 text-red-300',
}

const labels: Record<FarmStatus, string> = {
  scored: 'Scored',
  analyzing: 'Analyzing from orbit…',
  insufficient_data: 'Needs more seasons',
  failed: 'Analysis failed',
}

export default function StatusChip({ status }: { status: FarmStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}
