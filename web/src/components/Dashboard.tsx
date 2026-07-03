import { useEffect, useMemo, useState } from 'react'
import AnimatedContent from './reactbits/AnimatedContent'
import CountUp from './reactbits/CountUp'
import FarmCard from './FarmCard'
import FarmMap from './FarmMap'
import NdviChart from './NdviChart'
import { fetchFarms, fetchTimeseries } from '../api'
import type { Farm, Reading } from '../types'

function Stat({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b1210]/70 px-6 py-5">
      <div className="flex items-baseline gap-1 text-3xl font-bold text-emerald-300">
        <CountUp to={value} duration={1.4} />
        {suffix && <span className="text-lg">{suffix}</span>}
      </div>
      <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-100/40">{label}</div>
    </div>
  )
}

export default function Dashboard() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [readings, setReadings] = useState<Reading[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFarms()
      .then(list => {
        setFarms(list)
        setSelectedId(list[0]?.id ?? null)
      })
      .catch(e => setError(String(e)))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    fetchTimeseries(selectedId)
      .then(setReadings)
      .catch(() => setReadings([]))
  }, [selectedId])

  const selected = useMemo(
    () => farms.find(f => f.id === selectedId) ?? null,
    [farms, selectedId],
  )
  const scored = farms.filter(f => f.score)
  const avgScore = scored.length
    ? Math.round(scored.reduce((sum, f) => sum + (f.score?.terra_score ?? 0), 0) / scored.length)
    : 0
  const totalSeasons = scored.reduce((sum, f) => sum + (f.score?.seasons_observed ?? 0), 0)

  return (
    <section id="command" className="mx-auto max-w-7xl px-6 py-24">
      <AnimatedContent distance={60} duration={0.8}>
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/70">
          Command Center
        </div>
        <h2 className="mt-2 text-3xl font-bold md:text-4xl">Portfolio from orbit</h2>
        <p className="mt-2 max-w-xl text-sm text-emerald-100/50">
          Every polygon is a real field. Every score is computed from cloud-masked Sentinel-2
          reflectance across Rwanda's growing seasons.
        </p>
      </AnimatedContent>

      {error && (
        <div className="mt-8 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {error} — is the TERRA API running on port 8100?
        </div>
      )}

      {farms.length > 0 && (
        <>
          <AnimatedContent distance={40} duration={0.7} delay={0.1}>
            <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Stat label="Fields monitored" value={farms.length} />
              <Stat label="Average TERRA score" value={avgScore} />
              <Stat label="Seasons analyzed" value={totalSeasons} />
              <Stat label="Years of history" value={2} suffix="+" />
            </div>
          </AnimatedContent>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <AnimatedContent distance={50} duration={0.8} direction="horizontal" reverse>
              <div className="h-[480px] overflow-hidden rounded-3xl border border-white/10">
                <FarmMap farms={farms} selectedId={selectedId} onSelect={setSelectedId} />
              </div>
            </AnimatedContent>
            <div className="grid content-start gap-4">
              {farms.map((farm, i) => (
                <AnimatedContent key={farm.id} distance={50} duration={0.7} delay={i * 0.12} direction="horizontal">
                  <FarmCard farm={farm} selected={farm.id === selectedId} onSelect={setSelectedId} />
                </AnimatedContent>
              ))}
            </div>
          </div>

          {selected && readings.length > 0 && (
            <AnimatedContent distance={50} duration={0.8}>
              <div className="mt-8 rounded-3xl border border-white/10 bg-[#0b1210]/70 p-6">
                <div className="mb-4 flex items-baseline justify-between">
                  <h3 className="text-sm font-semibold text-emerald-100/80">
                    {selected.name} — field health, last two years
                  </h3>
                  <span className="text-[11px] uppercase tracking-wider text-emerald-100/40">
                    {readings.length} cloud-masked readings
                  </span>
                </div>
                <NdviChart readings={readings} />
              </div>
            </AnimatedContent>
          )}
        </>
      )}
    </section>
  )
}
