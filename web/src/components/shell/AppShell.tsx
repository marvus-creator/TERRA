import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import NavBar, { NAV_LINKS } from './NavBar'
import CommandPalette from './CommandPalette'
import Tour from './Tour'
import Logo from './Logo'
import ClickSpark from '../reactbits/ClickSpark'
import { ToastProvider, useToast } from '../ui/Toast'

function isTyping() {
  const el = document.activeElement as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function Shortcuts({ onPalette, onTour }: { onPalette: () => void; onTour: () => void }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  useEffect(() => {
    let chord: number | null = null
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onPalette()
        return
      }
      if (isTyping()) return
      if (e.key === '?') {
        e.preventDefault()
        onTour()
        return
      }
      if (chord != null) {
        window.clearTimeout(chord)
        chord = null
        const target = e.key === 'r' ? { to: '/register', label: 'Register' } : NAV_LINKS.find(l => l.key === e.key)
        if (target) {
          navigate(target.to)
          toast(`Jumped to ${target.label}`)
        }
        return
      }
      if (e.key === 'g') {
        chord = window.setTimeout(() => {
          chord = null
        }, 900)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, onPalette, onTour, toast])
  return null
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-line/70">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="font-display text-lg font-semibold tracking-[0.12em] text-olive">TERRA</span>
          </div>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
            A field notebook that talks to a satellite. Sentinel-2 imagery becomes a credit history for farmers who never had one.
          </p>
          <div className="mt-4 h-1.5 w-40 rounded-full ndvi-ramp" />
        </div>
        <div className="text-sm">
          <div className="overline mb-3">Explore</div>
          <ul className="grid gap-2 text-muted">
            {NAV_LINKS.map(l => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-olive">
                  {l.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/register" className="hover:text-olive">
                Register a farm
              </Link>
            </li>
          </ul>
        </div>
        <div className="text-sm">
          <div className="overline mb-3">Keyboard</div>
          <ul className="grid gap-2 text-muted">
            <li>
              <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd> jump palette
            </li>
            <li>
              <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px]">?</kbd> guided tour
            </li>
            <li>
              <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px]">g</kbd> then <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px]">f</kbd> go to Farms
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/70 py-5 text-center text-xs text-muted">
        Built in Rwanda · imagery ESA Sentinel-2 via AWS Open Data · Bugesera District
      </div>
    </footer>
  )
}

export default function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [palette, setPalette] = useState(false)
  const [tour, setTour] = useState(false)
  const openPalette = useCallback(() => setPalette(p => !p), [])
  const openTour = useCallback(() => {
    setPalette(false)
    setTour(t => !t)
  }, [])
  const closeTour = useCallback(() => setTour(false), [])
  const closePalette = useCallback(() => setPalette(false), [])
  const fullBleed = location.pathname === '/map'

  return (
    <ToastProvider>
      <ClickSpark sparkColor="#c4622d" sparkRadius={20} sparkCount={8} duration={420}>
        <div className="flex min-h-screen flex-col">
          <NavBar onPalette={openPalette} onTour={openTour} />
          <main className="flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className={fullBleed ? 'h-[calc(100vh-4rem)]' : undefined}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
          {!fullBleed && <Footer />}
        </div>
        <Shortcuts onPalette={openPalette} onTour={openTour} />
        <ScrollToTop />
        <CommandPalette open={palette} onClose={closePalette} onTour={openTour} />
        <Tour open={tour} onClose={closeTour} />
      </ClickSpark>
    </ToastProvider>
  )
}
