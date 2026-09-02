import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CloudOff, Landmark, Orbit, PenLine, Satellite, Sprout, Users } from 'lucide-react'
import BlurText from '../components/reactbits/BlurText'
import OrbitArt from '../components/terra/OrbitArt'
import FarmCard from '../components/terra/FarmCard'
import { Button, Card, Reveal, Stagger, StaggerItem, Stat } from '../components/ui'
import { useAllSeries, useFarms, useStats } from '../hooks/useData'
import { fmtDate } from '../lib/format'

const steps = [
  {
    icon: <PenLine size={20} />,
    title: 'Draw the field',
    text: 'Tap the corners of the farm on a satellite map and give us a name. No paperwork, no bank statements, no collateral.',
    link: { to: '/register', label: 'Register a farm' },
  },
  {
    icon: <Satellite size={20} />,
    title: 'Satellites read the crops',
    text: 'Sentinel-2 photographs every field on Earth every five days. TERRA masks the clouds and measures crop health for every season since 2024.',
    link: { to: '/how-it-works', label: 'See the science' },
  },
  {
    icon: <Landmark size={20} />,
    title: 'A score a bank can trust',
    text: 'Two years of harvests become a TERRA Score from 300 to 850 — evidence a bank or SACCO can lend against, even with no bank account.',
    link: { to: '/lenders', label: 'Open the lender view' },
  },
]

const audiences = [
  { icon: <Sprout size={18} />, title: 'Farmers', text: 'Your land already proves you farm well. TERRA turns that proof into a credit file for seeds, fertiliser and equipment.' },
  { icon: <Landmark size={18} />, title: 'Banks & SACCOs', text: 'Lend to a market you could never see. Every applicant arrives with two years of objective, satellite-verified field performance.' },
  { icon: <Users size={18} />, title: 'Cooperatives', text: 'Register every member’s field in one afternoon and negotiate group credit backed by real harvest evidence.' },
]

function ComponentIllustration({ kind }: { kind: 'peak' | 'consistency' | 'trend' }) {
  const bars = kind === 'trend' ? [0.55, 0.62, 0.7, 0.8] : kind === 'consistency' ? [0.78, 0.8, 0.77, 0.81] : [0.74, 0.86, 0.92, 0.9]
  const colors = ['#c98b3a', '#e6c94a', '#9cbf3a', '#1c5c30']
  const mean = bars.reduce((a, b) => a + b, 0) / bars.length
  return (
    <svg viewBox="0 0 200 110" className="w-full">
      {bars.map((v, i) => (
        <motion.rect
          key={i}
          x={20 + i * 44}
          width={28}
          rx={5}
          fill={kind === 'trend' ? colors[i] : kind === 'consistency' ? '#77864f' : colors[i]}
          initial={{ y: 96, height: 0 }}
          whileInView={{ y: 96 - v * 80, height: v * 80 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
      {kind === 'peak' && bars.map((v, i) => <circle key={i} cx={34 + i * 44} cy={96 - v * 80} r={4} fill="#c4622d" stroke="#fcf9f2" strokeWidth={1.5} />)}
      {kind === 'consistency' && <rect x={12} y={96 - (mean + 0.02) * 80} width={176} height={0.04 * 80} fill="#c4622d" fillOpacity={0.18} />}
      {kind === 'consistency' && <line x1={12} x2={188} y1={96 - mean * 80} y2={96 - mean * 80} stroke="#c4622d" strokeDasharray="5 4" strokeWidth={1.5} />}
      {kind === 'trend' && (
        <motion.line x1={34} y1={96 - 0.55 * 80} x2={166} y2={96 - 0.82 * 80} stroke="#c4622d" strokeWidth={2.5} strokeLinecap="round" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.5 }} />
      )}
      <line x1={12} x2={188} y1={96} y2={96} stroke="#d8ccb2" />
    </svg>
  )
}

export default function Home() {
  const stats = useStats()
  const { farms } = useFarms()
  const series = useAllSeries()
  const featured = useMemo(() => (farms ?? []).filter(f => f.score).sort((a, b) => (b.score?.terra_score ?? 0) - (a.score?.terra_score ?? 0)).slice(0, 3), [farms])
  const hero = featured[0]
  const heroReadings = hero && series ? series[hero.id] ?? [] : []
  const latest = heroReadings[heroReadings.length - 1]

  return (
    <div>
      <section className="mx-auto max-w-7xl px-6 pb-10 pt-12 md:pt-16" data-tour="hero">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-olive-3">
              <span className="relative flex h-2 w-2">
                <span className="pulse-ring" />
                <span className="h-2 w-2 rounded-full bg-terracotta" />
              </span>
              Live over Bugesera · Rwanda
            </motion.div>
            <h1 className="font-display mt-6 text-5xl font-medium leading-[1.02] text-olive md:text-7xl">
              <BlurText text="Credit, seen from orbit." animateBy="words" delay={110} className="flex flex-wrap" />
            </h1>
            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Half a billion smallholder farmers cannot get a loan because they have no credit history. Their fields have been writing one from space for years. <span className="text-olive">TERRA reads it.</span>
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }} className="mt-8 flex flex-wrap items-center gap-3">
              <Button to="/register" variant="accent" size="lg" icon={<PenLine size={16} />}>
                Register a farm
              </Button>
              <Button to="/farms" variant="secondary" size="lg">
                See scored farms
                <ArrowRight size={16} />
              </Button>
              <span className="ml-1 text-xs text-muted">
                Press <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px]">?</kbd> for the guided tour
              </span>
            </motion.div>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}>
            <OrbitArt label={hero?.name ?? 'Mukamana Family Plot'} ndvi={latest ? Number(latest.ndvi_mean) : 0.83} date={latest ? fmtDate(latest.date) : stats?.overlay?.date ?? '30 Jun 2026'} />
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8" data-tour="counters">
        <Reveal>
          <Card className="grid gap-8 p-8 md:grid-cols-4 md:gap-4">
            <Stat label="Farms watched" value={stats?.farms} icon={<Sprout size={14} />} hint={stats ? `${stats.scored} scored · ${stats.analyzing} analysing` : undefined} />
            <Stat label="Hectares from orbit" value={stats?.hectares} decimals={1} icon={<Orbit size={14} />} hint={stats ? `${stats.districts.join(', ')} District` : undefined} />
            <Stat label="Scenes analysed" value={stats?.scenes} icon={<CloudOff size={14} />} hint="cloud-masked Sentinel-2 passes" />
            <Stat label="Average score" value={stats?.average_score} icon={<Landmark size={14} />} hint={stats?.latest_reading ? `latest reading ${fmtDate(stats.latest_reading)}` : undefined} />
          </Card>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <div className="rounded-[2.5rem] bg-olive px-8 py-12 text-cream md:px-14 md:py-16">
            <div className="max-w-2xl">
              <div className="overline !text-ndvi-2">How TERRA works</div>
              <h2 className="font-display mt-2 text-3xl font-medium md:text-5xl">Three steps from an unmapped field to a bankable score.</h2>
            </div>
            <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
              {steps.map((step, i) => (
                <StaggerItem key={step.title}>
                  <div className="flex h-full flex-col rounded-3xl border border-cream/10 bg-cream/5 p-6">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-ndvi-2 text-olive">{step.icon}</span>
                      <span className="font-display text-3xl text-cream/40">0{i + 1}</span>
                    </div>
                    <h3 className="font-display mt-5 text-2xl">{step.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/70">{step.text}</p>
                    <Link to={step.link.to} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-ndvi-2 hover:text-cream">
                      {step.link.label} <ArrowRight size={14} />
                    </Link>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12" data-tour="components">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-xl">
              <div className="overline">The score, unpacked</div>
              <h2 className="font-display mt-2 text-3xl font-medium text-olive md:text-4xl">Three ingredients. Nothing hidden.</h2>
              <p className="mt-3 text-muted">Every TERRA Score is the same simple recipe, applied to the field’s own seasonal harvest peaks.</p>
            </div>
            <Link to="/how-it-works" className="inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:text-terracotta-2">
              Read the exact formula <ArrowRight size={14} />
            </Link>
          </div>
        </Reveal>
        <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
          {[
            { kind: 'peak' as const, weight: '50%', title: 'Productivity', text: 'How strong the crops get at the peak of each growing season. Strong peaks mean real harvests.', color: '#3f8f3a' },
            { kind: 'consistency' as const, weight: '30%', title: 'Consistency', text: 'How similar those peaks are to each other. Season after season beats one great year.', color: '#9cbf3a' },
            { kind: 'trend' as const, weight: '20%', title: 'Trend', text: 'Whether the field is improving or declining over the two-year window. Improvement signals investment and skill.', color: '#c98b3a' },
          ].map(c => (
            <StaggerItem key={c.title}>
              <Card hover className="h-full">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-olive">{c.title}</h3>
                  <span className="rounded-full px-3 py-1 font-mono text-xs font-semibold text-cream" style={{ background: c.color }}>
                    {c.weight}
                  </span>
                </div>
                <div className="mt-4 rounded-2xl border border-line bg-cream/60 p-2">
                  <ComponentIllustration kind={c.kind} />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-muted">{c.text}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-12">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <div className="overline">From the portfolio</div>
                <h2 className="font-display mt-2 text-3xl font-medium text-olive md:text-4xl">Real fields, scored this season.</h2>
              </div>
              <Link to="/farms" className="inline-flex items-center gap-1 text-sm font-medium text-terracotta hover:text-terracotta-2">
                All farms <ArrowRight size={14} />
              </Link>
            </div>
          </Reveal>
          <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
            {featured.map(f => (
              <StaggerItem key={f.id}>
                <FarmCard farm={f} readings={series ? series[f.id] ?? [] : undefined} />
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-12">
        <Stagger className="grid gap-5 md:grid-cols-3">
          {audiences.map(a => (
            <StaggerItem key={a.title}>
              <Card tone="sand" className="h-full">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-olive">{a.icon}</span>
                <h3 className="font-display mt-4 text-xl text-olive">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{a.text}</p>
              </Card>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-line bg-paper px-8 py-14 text-center md:px-16">
            <div className="absolute inset-x-0 top-0 h-1.5 ndvi-ramp" />
            <h2 className="font-display text-3xl font-medium text-olive md:text-5xl">Your field has been building your credit for years.</h2>
            <p className="mx-auto mt-4 max-w-xl text-muted">Register it in under two minutes. From then on, the satellite is watching.</p>
            <div className="mt-8 flex justify-center">
              <Button to="/register" variant="accent" size="lg">
                Register your farm now
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
