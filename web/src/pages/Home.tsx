import { Link } from 'react-router-dom'
import Aurora from '../components/reactbits/Aurora'
import SplitText from '../components/reactbits/SplitText'
import BlurText from '../components/reactbits/BlurText'
import ShinyText from '../components/reactbits/ShinyText'
import GradientText from '../components/reactbits/GradientText'
import CountUp from '../components/reactbits/CountUp'
import AnimatedContent from '../components/reactbits/AnimatedContent'

const steps = [
  {
    number: '1',
    title: 'Draw your field',
    text: 'Open the map, tap the corners of your farm, and tell us your name. That is all TERRA needs — no paperwork, no bank statements, no collateral.',
    link: { to: '/register', label: 'Register a farm →' },
  },
  {
    number: '2',
    title: 'Satellites read your crops',
    text: 'The Sentinel-2 satellites photograph your field every 5 days. TERRA measures how green and healthy your crops have been across every growing season for the past two years.',
    link: { to: '/how-it-works', label: 'See the science →' },
  },
  {
    number: '3',
    title: 'Get a score banks trust',
    text: 'Your field history becomes a TERRA Score from 300 to 850 — proof of productivity a bank or SACCO can use to give you a loan, even if you have never had a bank account.',
    link: { to: '/farms', label: 'See scored farms →' },
  },
]

const audiences = [
  {
    icon: '🌾',
    title: 'Farmers',
    text: 'Your land already proves you are a good farmer. TERRA turns that proof into a credit file so you can borrow for seeds, fertilizer, and equipment.',
  },
  {
    icon: '🏦',
    title: 'Banks & SACCOs',
    text: 'Lend to a market you could never see before. Every applicant comes with two years of objective, satellite-verified field performance.',
  },
  {
    icon: '🤝',
    title: 'Cooperatives',
    text: 'Register all your members’ fields in one afternoon and negotiate group credit backed by real harvest evidence.',
  },
]

export default function Home() {
  return (
    <div>
      <section className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center overflow-hidden px-6">
        <div className="absolute inset-0">
          <Aurora colorStops={['#16a34a', '#4ade80', '#0ea5e9']} amplitude={1.1} blend={0.6} speed={0.7} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050807]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-emerald-200/80">
            Live over Bugesera District · Rwanda
          </div>
          <SplitText
            text="TERRA"
            tag="h1"
            className="text-6xl font-extrabold tracking-[0.3em] md:text-8xl"
            delay={90}
            duration={0.9}
            splitType="chars"
            from={{ opacity: 0, y: 80 }}
            to={{ opacity: 1, y: 0 }}
          />
          <BlurText
            text="The credit score for farmers, written by satellites."
            animateBy="words"
            delay={120}
            className="mt-8 justify-center text-xl font-light text-emerald-100/85 md:text-3xl"
          />
          <BlurText
            text="Half a billion farmers cannot get a loan because they have no credit history. Their fields have been writing one from space for years — TERRA reads it."
            animateBy="words"
            delay={30}
            className="mt-4 max-w-2xl justify-center text-sm text-emerald-100/50 md:text-base"
          />
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/register"
              className="rounded-full bg-emerald-500 px-8 py-3.5 text-sm font-semibold text-[#04130b] transition-colors hover:bg-emerald-400"
            >
              Register your farm
            </Link>
            <Link
              to="/map"
              className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-8 py-3.5 backdrop-blur transition-colors hover:bg-emerald-400/20"
            >
              <ShinyText text="Explore the live map" speed={3} className="text-sm font-medium" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <AnimatedContent distance={50} duration={0.8}>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8 text-center">
              <div className="flex items-baseline justify-center text-4xl font-extrabold text-emerald-300">
                <CountUp to={500} duration={1.6} />
                <span>M+</span>
              </div>
              <p className="mt-2 text-sm text-emerald-100/50">
                smallholder farmers worldwide feed most of the planet — and most cannot get a loan.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8 text-center">
              <div className="flex items-baseline justify-center text-4xl font-extrabold text-emerald-300">
                <span>$</span>
                <CountUp to={170} duration={1.6} />
                <span>B</span>
              </div>
              <p className="mt-2 text-sm text-emerald-100/50">
                of agricultural financing is needed every year in emerging markets and never arrives.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8 text-center">
              <div className="text-4xl font-extrabold text-emerald-300">
                <CountUp to={0} from={100} duration={1.6} />
              </div>
              <p className="mt-2 text-sm text-emerald-100/50">
                documents required by TERRA. Your field is your paperwork.
              </p>
            </div>
          </div>
        </AnimatedContent>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <AnimatedContent distance={50} duration={0.8}>
          <h2 className="text-center text-3xl font-bold md:text-4xl">
            <GradientText colors={['#4ade80', '#22d3ee', '#4ade80']} animationSpeed={6}>
              How TERRA works
            </GradientText>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-emerald-100/50">
            Three steps from an unmapped field to a bankable credit score.
          </p>
        </AnimatedContent>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <AnimatedContent key={step.number} distance={60} duration={0.7} delay={i * 0.15}>
              <div className="h-full rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/15 text-lg font-bold text-emerald-300">
                  {step.number}
                </div>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/50">{step.text}</p>
                <Link to={step.link.to} className="mt-5 inline-block text-sm font-medium text-emerald-300 hover:text-emerald-200">
                  {step.link.label}
                </Link>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <AnimatedContent distance={50} duration={0.8}>
          <h2 className="text-center text-3xl font-bold md:text-4xl">Who TERRA is for</h2>
        </AnimatedContent>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {audiences.map((audience, i) => (
            <AnimatedContent key={audience.title} distance={60} duration={0.7} delay={i * 0.15}>
              <div className="h-full rounded-3xl border border-white/10 bg-[#0b1210]/70 p-8">
                <div className="text-3xl">{audience.icon}</div>
                <h3 className="mt-4 text-lg font-semibold">{audience.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-emerald-100/50">{audience.text}</p>
              </div>
            </AnimatedContent>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20">
        <AnimatedContent distance={50} duration={0.8}>
          <div className="rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-emerald-400/10 to-sky-400/5 p-10 text-center md:p-16">
            <h2 className="text-2xl font-bold md:text-3xl">Your field has been building your credit for years.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-emerald-100/50">
              Register it in under two minutes and let the satellites do the rest.
            </p>
            <Link
              to="/register"
              className="mt-8 inline-block rounded-full bg-emerald-500 px-10 py-4 text-sm font-semibold text-[#04130b] transition-colors hover:bg-emerald-400"
            >
              Register your farm now
            </Link>
          </div>
        </AnimatedContent>
      </section>
    </div>
  )
}
