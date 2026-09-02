import { useMemo, useState } from 'react'
import { ArrowDownUp, Search, Sprout } from 'lucide-react'
import FarmCard from '../components/terra/FarmCard'
import { Button, CardSkeleton, EmptyState, PageHeader, Stagger, StaggerItem, Tabs } from '../components/ui'
import { useAllSeries, useFarms } from '../hooks/useData'
import { farmHectares } from '../lib/score'
import type { Farm, FarmStatus } from '../types'

type Filter = 'all' | 'scored' | 'analyzing' | 'needs'
type Sort = 'score' | 'hectares' | 'name' | 'newest'

const sorters: Record<Sort, (a: Farm, b: Farm) => number> = {
  score: (a, b) => (b.score?.terra_score ?? -1) - (a.score?.terra_score ?? -1),
  hectares: (a, b) => farmHectares(b) - farmHectares(a),
  name: (a, b) => a.name.localeCompare(b.name),
  newest: (a, b) => b.registered.localeCompare(a.registered),
}

const filterStatus: Record<Filter, FarmStatus[] | null> = {
  all: null,
  scored: ['scored'],
  analyzing: ['analyzing'],
  needs: ['insufficient_data', 'failed'],
}

export default function Farms() {
  const { farms, loading, error, reload } = useFarms()
  const series = useAllSeries()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [sort, setSort] = useState<Sort>('score')

  const counts = useMemo(() => {
    const all = farms ?? []
    return {
      all: all.length,
      scored: all.filter(f => f.status === 'scored').length,
      analyzing: all.filter(f => f.status === 'analyzing').length,
      needs: all.filter(f => f.status === 'insufficient_data' || f.status === 'failed').length,
    }
  }, [farms])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    const allowed = filterStatus[filter]
    return (farms ?? [])
      .filter(f => !allowed || allowed.includes(f.status))
      .filter(f => !q || f.name.toLowerCase().includes(q) || f.owner.toLowerCase().includes(q) || f.district.toLowerCase().includes(q))
      .sort(sorters[sort])
  }, [farms, query, filter, sort])

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader
        overline="Portfolio"
        title="Every farm, watched from orbit."
        lede="Each card carries the field’s NDVI history, its score band and the seasons the satellite has already seen. Open one for the full credit file."
        actions={
          <Button to="/register" variant="accent">
            Register a farm
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative flex-1 basis-64">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by farm, owner or district…"
            className="focus-ring h-11 w-full rounded-full border border-line bg-paper pl-10 pr-4 text-sm text-ink outline-none placeholder:text-muted/70 focus:border-olive-3"
          />
        </label>
        <Tabs
          id="farm-filter"
          value={filter}
          onChange={setFilter}
          tabs={[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'scored', label: 'Scored', count: counts.scored },
            { value: 'analyzing', label: 'Analysing', count: counts.analyzing },
            { value: 'needs', label: 'Needs data', count: counts.needs },
          ]}
        />
        <label className="flex h-11 items-center gap-2 rounded-full border border-line bg-paper px-4 text-sm text-muted">
          <ArrowDownUp size={14} />
          <select value={sort} onChange={e => setSort(e.target.value as Sort)} className="bg-transparent text-ink outline-none">
            <option value="score">Highest score</option>
            <option value="hectares">Largest field</option>
            <option value="newest">Newest</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      {error && (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-terracotta/30 bg-terracotta-soft p-4 text-sm text-terracotta">
          <span>{error} — is the TERRA API running on port 8100?</span>
          <Button size="sm" variant="secondary" onClick={reload}>
            Retry
          </Button>
        </div>
      )}

      <div className="mt-8" data-tour="farm-grid">
        {loading && (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map(i => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}
        {!loading && !error && visible.length === 0 && (
          <EmptyState
            icon={<Sprout size={22} />}
            title={query ? 'No farms match that search' : 'No farms here yet'}
            body={query ? 'Try the owner’s name, the farm name, or a district.' : 'Register a field and the satellite starts building its credit file within minutes.'}
            action={
              <Button to="/register" variant="accent">
                Register the first farm
              </Button>
            }
          />
        )}
        {!loading && visible.length > 0 && (
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {visible.map(f => (
              <StaggerItem key={f.id}>
                <FarmCard farm={f} readings={series ? series[f.id] ?? [] : undefined} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  )
}
