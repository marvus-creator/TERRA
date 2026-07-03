import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SpotlightCard from '../components/reactbits/SpotlightCard'
import CountUp from '../components/reactbits/CountUp'
import StatusChip from '../components/StatusChip'
import { fetchFarms } from '../api'
import type { Farm } from '../types'

export default function Farms() {
  const [farms, setFarms] = useState<Farm[]>([])
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFarms()
      .then(setFarms)
      .catch(e => setError(String(e)))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return farms
    return farms.filter(
      f =>
        f.name.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q),
    )
  }, [farms, query])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/70">Portfolio</div>
          <h1 className="mt-2 text-3xl font-bold">Registered farms</h1>
          <p className="mt-2 text-sm text-emerald-100/50">
            Every farm below is monitored from orbit. Click one to open its full credit file.
          </p>
        </div>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by farm, owner, or district…"
          className="w-full max-w-xs rounded-full border border-white/10 bg-[#0b1210] px-5 py-2.5 text-sm outline-none placeholder:text-emerald-100/30 focus:border-emerald-400/50"
        />
      </div>

      {error && (
        <div className="mt-8 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-200">
          {error} — is the TERRA API running on port 8100?
        </div>
      )}
      {loading && <div className="mt-12 text-sm text-emerald-100/40">Loading portfolio…</div>}
      {!loading && !error && filtered.length === 0 && (
        <div className="mt-12 rounded-3xl border border-white/10 bg-[#0b1210]/70 p-12 text-center">
          <p className="text-emerald-100/60">No farms match your search.</p>
          <Link to="/register" className="mt-4 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200">
            Register the first one →
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map(farm => (
          <Link key={farm.id} to={`/farms/${farm.id}`} className="block">
            <SpotlightCard
              className="h-full border-white/10 bg-[#0b1210]/90 p-6 transition hover:border-emerald-400/40"
              spotlightColor="rgba(74, 222, 128, 0.18)"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{farm.name}</h2>
                  <div className="mt-1 text-xs text-emerald-100/40">
                    {farm.owner} · {farm.district}
                  </div>
                </div>
                <StatusChip status={farm.status} />
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  {farm.score ? (
                    <CountUp to={farm.score.terra_score} duration={1.4} className="text-4xl font-bold text-emerald-300" />
                  ) : (
                    <span className="text-3xl font-bold text-emerald-100/30">—</span>
                  )}
                  <div className="mt-1 text-[11px] uppercase tracking-wider text-emerald-100/40">Terra Score</div>
                </div>
                <span className="pb-1 text-sm text-emerald-300">Open file →</span>
              </div>
            </SpotlightCard>
          </Link>
        ))}
      </div>
    </div>
  )
}
