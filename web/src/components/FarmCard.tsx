import SpotlightCard from './reactbits/SpotlightCard'
import CountUp from './reactbits/CountUp'
import GradientText from './reactbits/GradientText'
import type { Farm } from '../types'

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] text-emerald-100/50">
        <span>{label}</span>
        <span>{Math.round(value * 100)}%</span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-emerald-300"
          style={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  )
}

interface FarmCardProps {
  farm: Farm
  selected: boolean
  onSelect: (id: string) => void
}

export default function FarmCard({ farm, selected, onSelect }: FarmCardProps) {
  return (
    <div onClick={() => onSelect(farm.id)} className="cursor-pointer">
      <SpotlightCard
        className={`border-white/10 bg-[#0b1210]/90 p-6 transition ${selected ? 'ring-1 ring-emerald-400/60' : ''}`}
        spotlightColor="rgba(74, 222, 128, 0.18)"
      >
        <GradientText
          colors={['#4ade80', '#22d3ee', '#4ade80']}
          animationSpeed={6}
          className="text-sm font-semibold"
        >
          {farm.name}
        </GradientText>
        <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-100/40">
          {farm.id} · {farm.score?.seasons_observed ?? 0} seasons observed
        </div>
        <div className="mt-4 flex items-end gap-2">
          {farm.score ? (
            <CountUp to={farm.score.terra_score} duration={1.6} className="text-5xl font-bold text-emerald-300" />
          ) : (
            <span className="text-3xl text-emerald-100/40">—</span>
          )}
          <span className="pb-1 text-[11px] uppercase tracking-wider text-emerald-100/40">
            Terra Score
          </span>
        </div>
        {farm.score && (
          <div className="mt-4 grid gap-3">
            <Bar label="Productivity" value={farm.score.peak_component} />
            <Bar label="Consistency" value={farm.score.consistency_component} />
            <Bar label="Trend" value={farm.score.trend_component} />
          </div>
        )}
      </SpotlightCard>
    </div>
  )
}
