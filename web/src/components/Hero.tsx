import Aurora from './reactbits/Aurora'
import SplitText from './reactbits/SplitText'
import BlurText from './reactbits/BlurText'
import ShinyText from './reactbits/ShinyText'

export default function Hero() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <Aurora colorStops={['#16a34a', '#4ade80', '#0ea5e9']} amplitude={1.1} blend={0.6} speed={0.7} />
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050807]" />
      <div className="relative z-10 flex flex-col items-center px-6 text-center">
        <div className="mb-6 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-emerald-200/80">
          Bugesera District · Rwanda · Sentinel-2 Live Archive
        </div>
        <SplitText
          text="TERRA"
          tag="h1"
          className="text-7xl font-extrabold tracking-[0.3em] md:text-9xl"
          delay={90}
          duration={0.9}
          splitType="chars"
          from={{ opacity: 0, y: 80 }}
          to={{ opacity: 1, y: 0 }}
        />
        <BlurText
          text="Credit scores written by satellites."
          animateBy="words"
          delay={130}
          className="mt-8 justify-center text-xl font-light text-emerald-100/85 md:text-3xl"
        />
        <BlurText
          text="TERRA turns two years of orbital imagery into lending decisions for the 500 million farmers banks cannot see."
          animateBy="words"
          delay={35}
          className="mt-4 max-w-2xl justify-center text-sm text-emerald-100/50 md:text-base"
        />
        <a
          href="#command"
          className="mt-12 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-8 py-3 backdrop-blur transition-colors hover:bg-emerald-400/20"
        >
          <ShinyText text="Enter the Command Center" speed={3} className="text-sm font-medium" />
        </a>
      </div>
    </section>
  )
}
