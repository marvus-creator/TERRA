import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, CloudOff, Leaf, Satellite, Scale, Sun } from 'lucide-react'
import { Button, Card, PageHeader, Reveal, Stagger, StaggerItem } from '../components/ui'
import { ndviColor } from '../lib/score'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function SeasonStrip() {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-12 gap-1">
        {MONTHS.map((m, i) => {
          const a = i <= 1 || i >= 8
          const b = i >= 2 && i <= 5
          return (
            <div key={m} className="text-center">
              <div className={`h-8 rounded-md ${a ? 'bg-ndvi-2/60' : b ? 'bg-olive-3/40' : 'bg-sand'}`} />
              <div className="mt-1 text-[10px] text-muted">{m}</div>
            </div>
          )
        })}
      </div>
      <div className="mt-2 flex gap-4 text-[11px] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-ndvi-2/60" /> Season A · Sep → Feb
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-olive-3/40" /> Season B · Mar → Jun
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-sand" /> Jul–Aug dry gap, not scored
        </span>
      </div>
    </div>
  )
}

function NdviRamp() {
  const samples = [0.08, 0.2, 0.35, 0.5, 0.65, 0.8, 0.9]
  return (
    <div className="mt-4 grid grid-cols-7 gap-1.5">
      {samples.map(v => (
        <div key={v} className="text-center">
          <div className="h-10 rounded-md border border-line" style={{ background: ndviColor(v) }} />
          <div className="mt-1 font-mono text-[10px] text-olive">{v.toFixed(2)}</div>
          <div className="text-[9px] text-muted">{v < 0.2 ? 'soil' : v < 0.5 ? 'sparse' : v < 0.75 ? 'growing' : 'thriving'}</div>
        </div>
      ))}
    </div>
  )
}

function CloudMask() {
  const cells = [1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1]
  return (
    <div className="mt-4 grid grid-cols-8 gap-1">
      {cells.map((c, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.03 }}
          className={`flex h-8 items-center justify-center rounded-md text-[9px] ${c ? '' : 'bg-sand text-muted line-through'}`}
          style={c ? { background: ndviColor(0.55 + ((i * 7) % 5) * 0.07) } : undefined}
        >
          {c ? '' : 'cloud'}
        </motion.div>
      ))}
    </div>
  )
}

const sections = [
  { icon: <Satellite size={18} />, title: 'The satellites', body: 'TERRA uses the European Space Agency’s Sentinel-2 mission — two satellites that photograph every farm on Earth roughly every five days, at 10-metre detail, in visible and infrared light. The imagery is free and public, so TERRA’s raw data can be verified by anyone, including the bank.', art: null },
  { icon: <Leaf size={18} />, title: 'Reading crop health', body: 'Healthy plants strongly reflect near-infrared light that our eyes cannot see. Comparing infrared to red light gives NDVI — a plant-health number between 0 and 1 — for every 10 × 10 metre square of a field. Bare soil sits near 0.1; a thriving maize crop reaches 0.7 or higher.', formula: 'NDVI = (NIR − Red) ÷ (NIR + Red)', art: <NdviRamp /> },
  { icon: <CloudOff size={18} />, title: 'Cleaning the data', body: 'Rwanda is cloudy, and a cloud can look like a failed crop if you are careless. TERRA uses the satellite’s own scene-classification layer to discard every cloudy or shadowed pixel individually and applies the official radiometric offset, so only genuine ground readings enter a farmer’s file. Readings with fewer than 5 clean pixels are thrown away.', art: <CloudMask /> },
  { icon: <Sun size={18} />, title: 'Rwanda’s seasons', body: 'Readings are grouped into the country’s two agricultural seasons. Scoring per season instead of per month means a farmer is judged by harvests — the rhythm banks actually lend against. A season needs at least two clean passes to count.', art: <SeasonStrip /> },
]

const formulaLines = [
  { k: 'peak', v: 'clip((mean(season peaks) − 0.2) ÷ 0.5, 0, 1)', note: 'Season peak = 90th-percentile NDVI of that season' },
  { k: 'consistency', v: 'clip(1 − std(season peaks) ÷ 0.15, 0, 1)', note: 'Population standard deviation across seasons' },
  { k: 'trend', v: 'clip(0.5 + slope(season peaks) ÷ 0.1, 0, 1)', note: 'Least-squares slope per season' },
  { k: 'raw', v: '0.5 × peak + 0.3 × consistency + 0.2 × trend', note: 'Weights sum to one' },
  { k: 'TERRA Score', v: 'round(300 + raw × 550)', note: 'Needs at least two scored seasons' },
]

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <PageHeader overline="Methodology" title="How a field becomes a credit score." lede="No paperwork, no guarantors, no smartphone required from the farmer. Just physics, public satellite data and transparent arithmetic. Here is the whole pipeline in plain language." />

      <Stagger className="grid gap-6">
        {sections.map((s, i) => (
          <StaggerItem key={s.title}>
            <Card className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sand text-olive">{s.icon}</span>
                  <span className="font-display text-3xl text-line">0{i + 1}</span>
                </div>
                <h2 className="font-display mt-3 text-2xl text-olive">{s.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
                {'formula' in s && s.formula && <div className="mt-4 inline-block rounded-lg border border-line bg-cream/60 px-3 py-1.5 font-mono text-xs text-olive">{s.formula}</div>}
              </div>
              <div className="flex flex-col justify-center rounded-2xl border border-line bg-cream/50 p-4">
                {s.art ?? (
                  <div className="grid grid-cols-3 gap-3 text-center text-sm">
                    <div>
                      <div className="font-display text-3xl text-olive">10 m</div>
                      <div className="text-[11px] text-muted">pixel size</div>
                    </div>
                    <div>
                      <div className="font-display text-3xl text-olive">5 days</div>
                      <div className="text-[11px] text-muted">revisit time</div>
                    </div>
                    <div>
                      <div className="font-display text-3xl text-olive">Free</div>
                      <div className="text-[11px] text-muted">public archive</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>

      <Reveal className="mt-6">
        <div className="relative overflow-hidden rounded-3xl bg-olive p-8 text-cream" data-tour="formula">
          <div className="absolute inset-x-0 top-0 h-1.5 ndvi-ramp" />
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream/10 text-ndvi-2">
              <Scale size={18} />
            </span>
            <span className="font-display text-3xl text-cream/30">05</span>
          </div>
          <h2 className="font-display mt-3 text-2xl">The TERRA Score, exactly as the engine computes it</h2>
          <p className="mt-2 max-w-xl text-sm text-cream/70">Three components, deliberately simple enough to explain to a loan committee in one minute. This is the full formula, no rounding hidden.</p>
          <div className="mt-6 grid gap-2">
            {formulaLines.map((l, i) => (
              <motion.div key={l.k} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="grid items-center gap-2 rounded-xl border border-cream/10 bg-cream/5 px-4 py-3 md:grid-cols-[130px_1fr_auto]">
                <span className="font-mono text-xs font-semibold text-ndvi-2">{l.k}</span>
                <span className="font-mono text-sm">{l.v}</span>
                <span className="text-[11px] text-cream/50">{l.note}</span>
              </motion.div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {[
              { w: '50%', t: 'Productivity', d: 'Strong peaks mean real harvests.' },
              { w: '30%', t: 'Consistency', d: 'Season after season beats one great year.' },
              { w: '20%', t: 'Trend', d: 'An improving field signals investment and skill.' },
            ].map(c => (
              <div key={c.t} className="rounded-2xl border border-cream/10 p-4">
                <div className="font-display text-3xl text-ndvi-2">{c.w}</div>
                <div className="mt-1 font-semibold">{c.t}</div>
                <div className="text-xs text-cream/60">{c.d}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-cream/60">
            <span className="rounded-full border border-cream/15 px-2.5 py-1">300–639 Building history</span>
            <span className="rounded-full border border-cream/15 px-2.5 py-1">640–699 Fair</span>
            <span className="rounded-full border border-cream/15 px-2.5 py-1">700–759 Good</span>
            <span className="rounded-full border border-cream/15 px-2.5 py-1">760–850 Excellent</span>
          </div>
        </div>
      </Reveal>

      <Reveal className="mt-6">
        <Card tone="sand">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-paper text-terracotta">
              <Scale size={18} />
            </span>
            <h2 className="font-display text-2xl text-olive">Honesty about limits</h2>
          </div>
          <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted md:grid-cols-2">
            <li className="rounded-2xl bg-paper p-4">This is a transparent heuristic (version 1), not a machine-learned model. The weights have not yet been calibrated against real repayment outcomes — that calibration is the roadmap.</li>
            <li className="rounded-2xl bg-paper p-4">Satellite pixels are 10 × 10 metres, so scores are most reliable for fields of roughly half a hectare or larger.</li>
            <li className="rounded-2xl bg-paper p-4">A score measures the field’s productivity, not the person’s character. It should inform a lending decision, not replace one.</li>
            <li className="rounded-2xl bg-paper p-4">Two years of history is a minimum. Every additional season makes every score sharper.</li>
          </ul>
        </Card>
      </Reveal>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Button to="/farms" variant="primary">
          See it applied to real farms <ArrowRight size={14} />
        </Button>
        <Link to="/lenders" className="text-sm font-medium text-terracotta hover:text-terracotta-2">
          Open the lender view
        </Link>
      </div>
    </div>
  )
}
