import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Check, Link2, Satellite } from 'lucide-react'
import FieldMap from '../components/terra/FieldMap'
import ScoreGauge from '../components/terra/ScoreGauge'
import ScoreStory from '../components/terra/ScoreStory'
import ComponentBars from '../components/terra/ComponentBars'
import NdviChart from '../components/terra/NdviChart'
import SceneScrubber from '../components/terra/SceneScrubber'
import { Button, Card, PageHeader, Reveal, Skeleton, StatusBadge, useToast } from '../components/ui'
import { useFarm, useFarms } from '../hooks/useData'
import { bandFor, farmHectares, ndviColor, seasonLabel } from '../lib/score'
import { fmtDate, fmtHa } from '../lib/format'
import type { Farm } from '../types'

const STAGES = ['Searching the Sentinel-2 archive', 'Masking clouds and shadows', 'Measuring NDVI inside the field', 'Grouping passes into seasons', 'Writing the score']

function AnalysingPanel({ farm }: { farm: Farm }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const elapsed = Math.max(0, (now - Date.parse(farm.registered)) / 60000)
  const progress = Math.min(0.92, elapsed / 12)
  const stage = Math.min(STAGES.length - 1, Math.floor(progress * STAGES.length))
  return (
    <Card className="flex h-full flex-col">
      <div className="flex items-center gap-3">
        <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#dfe8ef] text-[#2b5b78]">
          <span className="pulse-ring !border-[#2b5b78]" />
          <Satellite size={18} />
        </span>
        <div>
          <div className="font-display text-xl text-olive">The satellite is reading this field</div>
          <div className="text-xs text-muted">{elapsed < 1 ? 'Just started' : `${Math.floor(elapsed)} min in`} · first results usually arrive within 5–15 minutes</div>
        </div>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-sand">
        <motion.div className="h-full rounded-full bg-[#2b5b78]" animate={{ width: `${Math.max(4, progress * 100)}%` }} transition={{ duration: 0.8 }} />
      </div>
      <ol className="mt-5 grid gap-2.5">
        {STAGES.map((s, i) => (
          <li key={s} className="flex items-center gap-3 text-sm">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${i < stage ? 'bg-ndvi-4 text-cream' : i === stage ? 'bg-[#2b5b78] text-cream' : 'bg-sand text-muted'}`}>
              {i < stage ? <Check size={12} /> : i + 1}
            </span>
            <span className={i <= stage ? 'text-olive' : 'text-muted'}>{s}</span>
            {i === stage && <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-[#2b5b78]" />}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs text-muted">This page refreshes itself every 15 seconds. You can leave and come back — the analysis continues on the server.</p>
    </Card>
  )
}

export default function FarmDetail() {
  const { farmId } = useParams()
  const { farm, readings, error } = useFarm(farmId)
  const { farms } = useFarms()
  const { toast } = useToast()
  const [active, setActive] = useState<number | null>(null)

  const siblings = useMemo(() => {
    const list = farms ?? []
    const i = list.findIndex(f => f.id === farmId)
    return { prev: i > 0 ? list[i - 1] : null, next: i >= 0 && i < list.length - 1 ? list[i + 1] : null }
  }, [farms, farmId])

  useEffect(() => {
    setActive(null)
  }, [farmId])

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="font-display text-3xl text-olive">This farm could not be found.</div>
        <p className="mt-3 text-muted">{error}</p>
        <div className="mt-6 flex justify-center">
          <Button to="/farms" variant="secondary" icon={<ArrowLeft size={14} />}>
            Back to portfolio
          </Button>
        </div>
      </div>
    )
  }

  if (!farm) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-4 h-12 w-96" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <Skeleton className="h-[380px] rounded-3xl" />
          <Skeleton className="h-[380px] rounded-3xl" />
        </div>
      </div>
    )
  }

  const band = bandFor(farm.score?.terra_score)
  const activeReading = active != null && readings ? readings[active] : null
  const fill = activeReading ? ndviColor(Number(activeReading.ndvi_mean)) : band?.color ?? '#e6c94a'
  const scenes = readings ?? []

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader
        crumbs={[
          { to: '/farms', label: 'Farms' },
          { to: `/farms/${farm.id}`, label: farm.name },
        ]}
        overline={`${farm.district} District · ${fmtHa(farmHectares(farm))}`}
        title={farm.name}
        lede={
          <>
            Owned by <span className="text-olive">{farm.owner}</span> · registered {fmtDate(farm.registered)} · {scenes.length} satellite scenes on file
          </>
        }
        aside={<StatusBadge status={farm.status} />}
        actions={
          <Button
            variant="secondary"
            size="sm"
            icon={<Link2 size={14} />}
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => undefined)
              toast('Link to this credit file copied', 'success')
            }}
          >
            Copy link
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <FieldMap farm={farm} fill={fill} scanning={farm.status === 'analyzing'} className="h-[400px]" label={activeReading ? `NDVI ${Number(activeReading.ndvi_mean).toFixed(2)} · ${fmtDate(activeReading.date)}` : undefined} />
        {farm.status === 'analyzing' ? (
          <AnalysingPanel farm={farm} />
        ) : farm.score ? (
          <Card className="flex flex-col">
            <ScoreGauge score={farm.score.terra_score} />
            <p className="mt-3 text-center text-sm text-muted">{band?.verdict}</p>
            <div className="mt-6">
              <ComponentBars score={farm.score} compact />
            </div>
            <div className="mt-5 text-[11px] text-muted">Based on {farm.score.seasons_observed} growing seasons of cloud-filtered Sentinel-2 imagery.</div>
          </Card>
        ) : (
          <Card className="flex flex-col items-center justify-center text-center">
            <ScoreGauge score={null} />
            <div className="font-display mt-2 text-xl text-olive">Not enough clean seasons yet</div>
            <p className="mt-2 max-w-sm text-sm text-muted">
              TERRA needs at least two complete growing seasons with clear satellite passes before it will issue a score. {farm.seasons.length === 1 ? 'One season is on file — the next harvest will complete the picture.' : 'Check back after the next harvest.'}
            </p>
          </Card>
        )}
      </div>

      {farm.score && (
        <Reveal className="mt-8">
          <Card>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="overline">Score Story</div>
                <h2 className="font-display mt-1 text-2xl text-olive">How {farm.name.split(' ')[0]}’s {farm.score.terra_score} was built</h2>
              </div>
              <span className="text-xs text-muted">Exactly the arithmetic the engine runs — on this farm’s own season peaks.</span>
            </div>
            <div className="mt-6">
              <ScoreStory farm={farm} />
            </div>
          </Card>
        </Reveal>
      )}

      {readings && readings.length > 0 && (
        <Reveal className="mt-8">
          <Card data-tour="chart">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <div className="overline">Field health over time</div>
                <h2 className="font-display mt-1 text-2xl text-olive">{readings.length} cloud-masked satellite passes</h2>
              </div>
              <div className="flex flex-wrap gap-3 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-ndvi-2/40" /> Season A (Sep–Feb)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-sm bg-olive-3/30" /> Season B (Mar–Jun)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ndvi-4" /> clear scene
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed border-ndvi-1" /> partly cloud-masked
                </span>
              </div>
            </div>
            <div className="mt-4">
              <NdviChart readings={readings} activeIndex={active} onPick={setActive} />
            </div>
            <div className="mt-4">
              <SceneScrubber readings={readings} index={active ?? readings.length - 1} onChange={setActive} />
            </div>
            <p className="mt-4 text-xs leading-relaxed text-muted">
              Each point is one satellite pass. NDVI measures how much healthy green vegetation covers the field — near 0 means bare soil, above 0.6 means dense thriving crops. The rise-and-fall is the planting and harvest rhythm of Rwanda’s two growing seasons. Drag the scrubber and the field on the map recolours to that day.
            </p>
          </Card>
        </Reveal>
      )}

      {farm.seasons.length > 0 && (
        <Reveal className="mt-8">
          <Card>
            <div className="overline">Season history</div>
            <h2 className="font-display mt-1 text-2xl text-olive">Harvest by harvest</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-muted">
                    <th className="pb-3 font-semibold">Season</th>
                    <th className="pb-3 font-semibold">Peak crop health</th>
                    <th className="pb-3 font-semibold">Average</th>
                    <th className="pb-3 font-semibold">Satellite passes</th>
                    <th className="pb-3 font-semibold">Colour</th>
                  </tr>
                </thead>
                <tbody>
                  {farm.seasons.map(s => (
                    <tr key={s.season} className="border-t border-line">
                      <td className="py-3 font-medium text-olive">{seasonLabel(s.season)}</td>
                      <td className="py-3 font-mono">{s.peak_ndvi.toFixed(3)}</td>
                      <td className="py-3 font-mono text-muted">{s.mean_ndvi.toFixed(3)}</td>
                      <td className="py-3">{s.observations}</td>
                      <td className="py-3">
                        <span className="inline-block h-4 w-14 rounded-md border border-line" style={{ background: ndviColor(s.peak_ndvi) }} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </Reveal>
      )}

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        {siblings.prev ? (
          <Link to={`/farms/${siblings.prev.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-olive">
            <ArrowLeft size={14} /> {siblings.prev.name}
          </Link>
        ) : (
          <span />
        )}
        {siblings.next && (
          <Link to={`/farms/${siblings.next.id}`} className="inline-flex items-center gap-2 text-sm text-muted hover:text-olive">
            {siblings.next.name} <ArrowRight size={14} />
          </Link>
        )}
      </div>
    </div>
  )
}
