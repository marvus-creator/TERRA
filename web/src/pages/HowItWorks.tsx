import { Link } from 'react-router-dom'
import AnimatedContent from '../components/reactbits/AnimatedContent'
import GradientText from '../components/reactbits/GradientText'

const sections = [
  {
    icon: '🛰️',
    title: 'The satellites',
    body: `TERRA uses the European Space Agency's Sentinel-2 mission — two satellites that photograph every farm on Earth roughly every 5 days, at 10-meter detail, in visible and infrared light. The imagery is free and public, which means TERRA's raw data can be independently verified by anyone, including the bank.`,
  },
  {
    icon: '🌿',
    title: 'Reading crop health',
    body: `Healthy plants strongly reflect near-infrared light that our eyes cannot see. By comparing infrared to red light, TERRA computes NDVI — a plant-health number between 0 and 1 — for every 10×10 meter square of a field. Bare soil sits near 0.1; a thriving maize crop reaches 0.7 or higher. Watch a field's NDVI across two years and you can see every planting, growth spurt, and harvest.`,
  },
  {
    icon: '☁️',
    title: 'Cleaning the data',
    body: `Rwanda is cloudy, and a cloud can look like a failed crop if you are careless. TERRA uses the satellite's own scene-classification layer to discard every cloudy or shadowed pixel individually, and applies the official radiometric corrections, so only genuine ground readings enter a farmer's file. A reading based on fewer than 5 clean pixels is thrown away entirely.`,
  },
  {
    icon: '🌦️',
    title: `Rwanda's seasons`,
    body: `Readings are grouped into the country's two agricultural seasons: Season A (September–February) and Season B (March–June). Scoring per season instead of per month means a farmer is judged by harvests — the rhythm banks actually lend against.`,
  },
]

const components = [
  { name: 'Productivity', weight: '50%', text: 'How strong the field gets at the peak of each growing season, averaged across all seasons observed. Strong peaks mean real harvests.' },
  { name: 'Consistency', weight: '30%', text: 'How similar those peaks are to each other. A farmer who delivers season after season is a fundamentally lower risk than one great year surrounded by failures.' },
  { name: 'Trend', weight: '20%', text: 'Whether the field is improving or declining across the full two-year window. An improving field signals investment and skill.' },
]

export default function HowItWorks() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-14">
      <div className="text-center">
        <div className="text-[11px] uppercase tracking-[0.25em] text-emerald-400/70">Methodology</div>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">
          <GradientText colors={['#4ade80', '#22d3ee', '#4ade80']} animationSpeed={6}>
            How a field becomes a credit score
          </GradientText>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/50">
          No paperwork, no guarantors, no smartphone required from the farmer. Just physics, public satellite data,
          and transparent math. Here is the entire pipeline, in plain language.
        </p>
      </div>

      <div className="mt-12 grid gap-6">
        {sections.map((section, i) => (
          <AnimatedContent key={section.title} distance={50} duration={0.7} delay={i * 0.08}>
            <div className="rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{section.icon}</span>
                <h2 className="text-lg font-semibold">{section.title}</h2>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-emerald-100/55">{section.body}</p>
            </div>
          </AnimatedContent>
        ))}

        <AnimatedContent distance={50} duration={0.7}>
          <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-transparent p-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🧮</span>
              <h2 className="text-lg font-semibold">The TERRA Score (300–850)</h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-emerald-100/55">
              Three components, deliberately simple enough to explain to a loan committee in one minute:
            </p>
            <div className="mt-6 grid gap-4">
              {components.map(c => (
                <div key={c.name} className="rounded-2xl border border-white/10 bg-[#080f0c] p-5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{c.name}</span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-bold text-emerald-300">{c.weight}</span>
                  </div>
                  <p className="mt-2 text-sm text-emerald-100/50">{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedContent>

        <AnimatedContent distance={50} duration={0.7}>
          <div className="rounded-3xl border border-amber-400/20 bg-amber-400/5 p-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚖️</span>
              <h2 className="text-lg font-semibold">Honesty about limits</h2>
            </div>
            <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-emerald-100/55">
              <li>• This is a transparent heuristic (version 1), not a machine-learned model — the weights have not yet been calibrated against real repayment outcomes. That calibration is the roadmap.</li>
              <li>• Satellite pixels are 10×10 meters, so scores are most reliable for fields of roughly half a hectare or larger.</li>
              <li>• A score measures the field's productivity, not the person's character — it should inform a lending decision, not replace one.</li>
              <li>• Two years of history is a minimum. Every additional season makes every score sharper.</li>
            </ul>
          </div>
        </AnimatedContent>
      </div>

      <div className="mt-12 text-center">
        <Link
          to="/register"
          className="inline-block rounded-full bg-emerald-500 px-10 py-4 text-sm font-semibold text-[#04130b] transition-colors hover:bg-emerald-400"
        >
          Put your field to work →
        </Link>
      </div>
    </div>
  )
}
