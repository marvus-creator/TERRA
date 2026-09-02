import { motion } from 'motion/react'
import type { FarmScore } from '../../types'
import { pct } from '../../lib/format'

const rows = [
  { key: 'peak_component', label: 'Productivity', weight: 0.5, color: '#3f8f3a', explain: 'How strong the crops get at the peak of each season.' },
  { key: 'consistency_component', label: 'Consistency', weight: 0.3, color: '#9cbf3a', explain: 'How similar the harvest peaks are, season after season.' },
  { key: 'trend_component', label: 'Trend', weight: 0.2, color: '#c98b3a', explain: 'Whether this field is improving or declining over time.' },
] as const

export default function ComponentBars({ score, compact = false }: { score: FarmScore; compact?: boolean }) {
  return (
    <div className={compact ? 'grid gap-3' : 'grid gap-5'}>
      {rows.map((row, i) => {
        const value = score[row.key]
        return (
          <div key={row.key}>
            <div className="flex items-baseline justify-between text-xs">
              <span className="font-semibold text-olive">
                {row.label} <span className="ml-1 font-normal text-muted">× {Math.round(row.weight * 100)}%</span>
              </span>
              <span className="font-mono text-olive">{pct(value)}</span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sand">
              <motion.div
                className="h-full rounded-full"
                style={{ background: row.color }}
                initial={{ width: 0 }}
                whileInView={{ width: `${value * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 * i }}
              />
            </div>
            {!compact && <p className="mt-1 text-[11px] text-muted">{row.explain}</p>}
          </div>
        )
      })}
    </div>
  )
}
