import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react'
import type { Farm } from '../../types'
import { ndviColor, seasonLabel, storyFrom, type Story } from '../../lib/score'
import { cx } from '../../lib/format'

const W = 420
const H = 200
const PAD_L = 36
const PAD_B = 34
const PAD_T = 18

function yOf(v: number) {
  return PAD_T + (1 - v) * (H - PAD_T - PAD_B)
}

function PeakBars({ story, step }: { story: Story; step: number }) {
  const n = story.peaks.length
  const slot = (W - PAD_L - 12) / n
  const bw = Math.min(56, slot * 0.55)
  const meanY = yOf(story.meanPeak)
  const xm = (n - 1) / 2
  const trendAt = (i: number) => story.meanPeak + story.slope * (i - xm)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={PAD_L} x2={W - 8} y1={yOf(t)} y2={yOf(t)} stroke="#d8ccb2" strokeDasharray="2 4" />
          <text x={PAD_L - 6} y={yOf(t) + 3} fontSize={9} textAnchor="end" fill="#6f6a57">
            {t.toFixed(2)}
          </text>
        </g>
      ))}
      {story.peaks.map((p, i) => {
        const x = PAD_L + slot * i + (slot - bw) / 2
        return (
          <g key={story.seasons[i]}>
            <motion.rect
              x={x}
              width={bw}
              rx={6}
              fill={ndviColor(p)}
              initial={{ y: yOf(0), height: 0 }}
              animate={{ y: yOf(p), height: yOf(0) - yOf(p) }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.08 * i }}
            />
            <text x={x + bw / 2} y={yOf(p) - 6} fontSize={10} textAnchor="middle" fill="#2f3a1f" fontWeight={600}>
              {p.toFixed(2)}
            </text>
            <text x={x + bw / 2} y={H - 14} fontSize={10} textAnchor="middle" fill="#6f6a57">
              {story.seasons[i].slice(0, 4)} {story.seasons[i].slice(4)}
            </text>
          </g>
        )
      })}
      <AnimatePresence>
        {step >= 1 && step <= 2 && (
          <motion.g key="mean" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <line x1={PAD_L} x2={W - 8} y1={meanY} y2={meanY} stroke="#c4622d" strokeWidth={1.5} strokeDasharray="6 4" />
            <text x={W - 10} y={meanY - 5} fontSize={10} textAnchor="end" fill="#c4622d" fontWeight={600}>
              mean {story.meanPeak.toFixed(3)}
            </text>
          </motion.g>
        )}
        {step === 2 && (
          <motion.rect
            key="std"
            x={PAD_L}
            width={W - PAD_L - 8}
            initial={{ opacity: 0, y: meanY, height: 0 }}
            animate={{ opacity: 1, y: yOf(story.meanPeak + story.std), height: Math.max(2, yOf(story.meanPeak - story.std) - yOf(story.meanPeak + story.std)) }}
            exit={{ opacity: 0 }}
            fill="#c4622d"
            fillOpacity={0.14}
          />
        )}
        {step === 3 && (
          <motion.line
            key="trend"
            x1={PAD_L + slot / 2}
            x2={PAD_L + slot * (n - 1) + slot / 2}
            y1={yOf(trendAt(0))}
            y2={yOf(trendAt(n - 1))}
            stroke="#c4622d"
            strokeWidth={2.5}
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
          />
        )}
      </AnimatePresence>
    </svg>
  )
}

function SumBar({ story }: { story: Story }) {
  const parts = [
    { label: 'Productivity', v: 0.5 * story.peakComponent, color: '#3f8f3a' },
    { label: 'Consistency', v: 0.3 * story.consistencyComponent, color: '#9cbf3a' },
    { label: 'Trend', v: 0.2 * story.trendComponent, color: '#c98b3a' },
  ]
  return (
    <div className="flex h-full flex-col justify-center gap-4">
      <div className="flex h-10 w-full overflow-hidden rounded-full bg-sand">
        {parts.map((p, i) => (
          <motion.div
            key={p.label}
            className="flex items-center justify-center text-[11px] font-semibold text-cream"
            style={{ background: p.color }}
            initial={{ width: 0 }}
            animate={{ width: `${p.v * 100}%` }}
            transition={{ duration: 0.9, delay: 0.2 * i, ease: [0.22, 1, 0.36, 1] }}
          >
            {p.v.toFixed(3)}
          </motion.div>
        ))}
      </div>
      <div className="flex justify-between text-[11px] text-muted">
        <span>0</span>
        <span>raw = {story.raw.toFixed(3)}</span>
        <span>1</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs">
        {parts.map(p => (
          <span key={p.label} className="flex items-center gap-1.5 text-muted">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function ScoreStory({ farm }: { farm: Farm }) {
  const story = useMemo(() => storyFrom(farm.seasons), [farm.seasons])
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => {
      setStep(s => {
        if (s >= 4) {
          setPlaying(false)
          return s
        }
        return s + 1
      })
    }, 3200)
    return () => clearTimeout(t)
  }, [playing, step])

  if (!story) return null
  const engine = farm.score?.terra_score
  const steps = [
    {
      title: `${story.peaks.length} seasons the satellite saw`,
      math: story.seasons.map((s, i) => `${seasonLabel(s)} peaked at ${story.peaks[i].toFixed(3)}`),
      note: 'Each bar is the 90th-percentile NDVI of one growing season — the harvest peak, after clouds are masked out.',
    },
    {
      title: 'Productivity · worth 50%',
      math: [`mean of peaks = ${story.meanPeak.toFixed(3)}`, `(${story.meanPeak.toFixed(3)} − 0.2) ÷ 0.5 = ${((story.meanPeak - 0.2) / 0.5).toFixed(3)}`, `clipped to 0–1 → ${story.peakComponent.toFixed(3)}`, `× 50% = ${(0.5 * story.peakComponent).toFixed(3)}`],
      note: 'A peak of 0.2 is bare soil and scores nothing; 0.7 or above is a dense, thriving crop and scores full marks.',
    },
    {
      title: 'Consistency · worth 30%',
      math: [`spread of peaks (σ) = ${story.std.toFixed(3)}`, `1 − ${story.std.toFixed(3)} ÷ 0.15 = ${(1 - story.std / 0.15).toFixed(3)}`, `clipped to 0–1 → ${story.consistencyComponent.toFixed(3)}`, `× 30% = ${(0.3 * story.consistencyComponent).toFixed(3)}`],
      note: 'The shaded band is one standard deviation around the mean. Tight band, reliable farmer.',
    },
    {
      title: 'Trend · worth 20%',
      math: [`best-fit slope = ${story.slope >= 0 ? '+' : ''}${story.slope.toFixed(3)} per season`, `0.5 + ${story.slope.toFixed(3)} ÷ 0.1 = ${(0.5 + story.slope / 0.1).toFixed(3)}`, `clipped to 0–1 → ${story.trendComponent.toFixed(3)}`, `× 20% = ${(0.2 * story.trendComponent).toFixed(3)}`],
      note: 'A flat field scores 0.5. Gaining a tenth of NDVI per season maxes it out; losing a tenth zeroes it.',
    },
    {
      title: 'The TERRA Score',
      math: [`raw = ${(0.5 * story.peakComponent).toFixed(3)} + ${(0.3 * story.consistencyComponent).toFixed(3)} + ${(0.2 * story.trendComponent).toFixed(3)} = ${story.raw.toFixed(3)}`, `300 + ${story.raw.toFixed(3)} × 550 = ${story.score}`],
      note: engine != null ? (engine === story.score ? `The Python engine computed ${engine} for this farm — the arithmetic above matches it exactly.` : `The engine computed ${engine}; the walkthrough rounds intermediate values slightly differently.`) : 'The engine has not issued a score yet.',
    },
  ]
  const current = steps[step]

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]" data-tour="story">
      <div className="flex flex-col">
        <ol className="grid gap-1.5">
          {steps.map((s, i) => (
            <li key={s.title}>
              <button
                onClick={() => {
                  setPlaying(false)
                  setStep(i)
                }}
                className={cx('focus-ring flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors', i === step ? 'bg-olive text-cream' : 'text-olive hover:bg-sand')}
              >
                <span className={cx('flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px]', i === step ? 'bg-cream/20' : i < step ? 'bg-ndvi-4 text-cream' : 'bg-sand text-muted')}>{i + 1}</span>
                <span className="font-medium">{s.title}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => {
              if (step >= 4) setStep(0)
              setPlaying(p => !p)
            }}
            className="focus-ring flex h-9 items-center gap-2 rounded-full bg-terracotta px-4 text-xs font-semibold text-cream hover:bg-terracotta-2"
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? 'Pause' : step >= 4 ? 'Replay' : 'Play the story'}
          </button>
          <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-olive hover:bg-sand disabled:opacity-30" aria-label="Previous step">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setStep(s => Math.min(4, s + 1))} disabled={step === 4} className="focus-ring flex h-9 w-9 items-center justify-center rounded-full border border-line text-olive hover:bg-sand disabled:opacity-30" aria-label="Next step">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <div className="rounded-2xl border border-line bg-cream/60 p-3">
          <AnimatePresence mode="wait">
            <motion.div key={step === 4 ? 'sum' : 'bars'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="h-full">
              {step === 4 ? <SumBar story={story} /> : <PeakBars story={story} step={step} />}
            </motion.div>
          </AnimatePresence>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.3 }} className="flex flex-col">
            <div className="overline">Step {step + 1}</div>
            <h4 className="font-display mt-1 text-xl text-olive">{current.title}</h4>
            <ul className="mt-3 grid gap-1.5 font-mono text-[12px] text-ink">
              {current.math.map((m, i) => (
                <motion.li key={m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.18 }} className={cx('rounded-lg border border-line bg-paper px-2.5 py-1.5', step === 4 && i === current.math.length - 1 && 'border-terracotta/40 bg-terracotta-soft font-semibold text-terracotta')}>
                  {m}
                </motion.li>
              ))}
            </ul>
            <p className="mt-3 text-xs leading-relaxed text-muted">{current.note}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
