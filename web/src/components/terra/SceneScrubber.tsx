import { useEffect, useState } from 'react'
import { Pause, Play, SkipBack, SkipForward } from 'lucide-react'
import type { Reading } from '../../types'
import { ndviColor } from '../../lib/score'
import { fmtDate } from '../../lib/format'

interface Props {
  readings: Reading[]
  index: number
  onChange: (i: number) => void
}

export default function SceneScrubber({ readings, index, onChange }: Props) {
  const [playing, setPlaying] = useState(false)
  const n = readings.length
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => {
      if (index >= n - 1) {
        setPlaying(false)
        return
      }
      onChange(index + 1)
    }, 380)
    return () => clearInterval(t)
  }, [playing, index, n, onChange])
  if (!n) return null
  const r = readings[Math.min(index, n - 1)]
  const ndvi = Number(r.ndvi_mean)
  const maxPix = Math.max(1, ...readings.map(x => Number(x.pixels)))
  const quality = Number(r.pixels) / maxPix
  return (
    <div className="rounded-2xl border border-line bg-cream/60 p-4" data-tour="scrubber">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-1">
          <button onClick={() => onChange(0)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-olive hover:bg-sand" aria-label="First scene">
            <SkipBack size={14} />
          </button>
          <button
            onClick={() => {
              if (index >= n - 1) onChange(0)
              setPlaying(p => !p)
            }}
            className="focus-ring flex h-9 w-9 items-center justify-center rounded-full bg-olive text-cream hover:bg-olive-2"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button onClick={() => onChange(n - 1)} className="focus-ring flex h-8 w-8 items-center justify-center rounded-full text-olive hover:bg-sand" aria-label="Last scene">
            <SkipForward size={14} />
          </button>
        </div>
        <input type="range" min={0} max={n - 1} value={index} onChange={e => onChange(Number(e.target.value))} className="min-w-[160px] flex-1" aria-label="Scene timeline" />
        <div className="flex items-center gap-3 text-xs">
          <span className="h-6 w-6 rounded-md border border-line" style={{ background: ndviColor(ndvi) }} />
          <div>
            <div className="font-semibold text-olive">{fmtDate(r.date)}</div>
            <div className="text-muted">
              Scene {index + 1} of {n} · Season {r.season.slice(4)} {r.season.slice(0, 4)}
            </div>
          </div>
          <div className="ml-2 border-l border-line pl-3">
            <div className="font-mono text-base font-semibold text-olive">{ndvi.toFixed(3)}</div>
            <div className="text-muted">NDVI</div>
          </div>
          <div className="border-l border-line pl-3">
            <div className="font-mono text-base font-semibold text-olive">{r.pixels}</div>
            <div className="text-muted">clear pixels{quality < 0.5 ? ' · partly masked' : ''}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
