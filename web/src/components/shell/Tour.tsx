import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, X } from 'lucide-react'
import { TOUR_STEPS } from './tourSteps'
import { cachedFarms } from '../../hooks/useData'

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

const PAD = 10

function resolveRoute(step: (typeof TOUR_STEPS)[number]) {
  const first = cachedFarms().find(f => f.status === 'scored')?.id ?? cachedFarms()[0]?.id ?? null
  return typeof step.route === 'function' ? step.route(first) : step.route
}

export default function Tour({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<Rect | null>(null)
  const [searching, setSearching] = useState(false)
  const stepRef = useRef(0)

  const measure = useCallback((el: Element) => {
    const r = el.getBoundingClientRect()
    setRect({ top: r.top - PAD, left: r.left - PAD, width: r.width + PAD * 2, height: r.height + PAD * 2 })
  }, [])

  const locate = useCallback(
    (i: number) => {
      const step = TOUR_STEPS[i]
      const route = resolveRoute(step)
      if (location.pathname !== route) navigate(route)
      setSearching(true)
      const started = Date.now()
      const tick = () => {
        if (stepRef.current !== i) return
        const el = document.querySelector(`[data-tour="${step.target}"]`)
        if (el) {
          el.scrollIntoView({ block: 'center', behavior: 'smooth' })
          setTimeout(() => {
            if (stepRef.current !== i) return
            measure(el)
            setSearching(false)
          }, 420)
          return
        }
        if (Date.now() - started < 5000) setTimeout(tick, 120)
        else setSearching(false)
      }
      tick()
    },
    [location.pathname, measure, navigate],
  )

  useEffect(() => {
    if (!open) return
    stepRef.current = index
    setRect(null)
    locate(index)
  }, [open, index, locate])

  useEffect(() => {
    if (!open) {
      setIndex(0)
      stepRef.current = 0
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onResize = () => {
      const el = document.querySelector(`[data-tour="${TOUR_STEPS[stepRef.current].target}"]`)
      if (el) measure(el)
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, true)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize, true)
    }
  }, [open, measure])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'Enter') setIndex(i => Math.min(TOUR_STEPS.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const step = TOUR_STEPS[index]
  const last = index === TOUR_STEPS.length - 1
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1440
  const vh = typeof window !== 'undefined' ? window.innerHeight : 900
  const cardW = 360
  const below = rect ? rect.top + rect.height + 200 < vh : true
  const cardTop = rect ? (below ? rect.top + rect.height + 14 : Math.max(16, rect.top - 190)) : vh / 2 - 90
  const cardLeft = rect ? Math.min(Math.max(16, rect.left), vw - cardW - 16) : vw / 2 - cardW / 2

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[1250]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-tour-overlay>
          <motion.div
            className="absolute rounded-2xl border-2 border-terracotta"
            style={{ boxShadow: '0 0 0 9999px rgba(31,36,22,0.55)', pointerEvents: 'none' }}
            animate={rect ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height, opacity: 1 } : { top: vh / 2, left: vw / 2, width: 0, height: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          />
          <div className="absolute inset-0" onClick={onClose} />
          <motion.div
            className="absolute rounded-3xl border border-line bg-paper p-5 shadow-[var(--shadow-float)]"
            style={{ width: cardW }}
            animate={{ top: cardTop, left: cardLeft, opacity: searching ? 0.6 : 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="overline">
                Tour · {index + 1} / {TOUR_STEPS.length}
              </span>
              <button onClick={onClose} className="focus-ring rounded-full p-1 text-muted hover:bg-sand hover:text-olive" aria-label="Close tour">
                <X size={16} />
              </button>
            </div>
            <h3 className="font-display mt-2 text-xl text-olive">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1">
                {TOUR_STEPS.map((_, i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full transition-colors" style={{ background: i <= index ? '#c4622d' : '#d8ccb2' }} />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIndex(i => Math.max(0, i - 1))}
                  disabled={index === 0}
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-full border border-line text-olive hover:bg-sand disabled:opacity-30"
                  aria-label="Previous"
                >
                  <ArrowLeft size={14} />
                </button>
                <button
                  onClick={() => (last ? onClose() : setIndex(i => i + 1))}
                  className="focus-ring flex h-8 items-center gap-1.5 rounded-full bg-olive px-3.5 text-xs font-medium text-cream hover:bg-olive-2"
                >
                  {last ? 'Finish' : 'Next'}
                  {!last && <ArrowRight size={14} />}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
