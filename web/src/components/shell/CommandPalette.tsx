import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, Compass, Home, Landmark, MapPinned, PlusCircle, Search, Sparkles, Sprout } from 'lucide-react'
import { useFarms } from '../../hooks/useData'
import { bandFor } from '../../lib/score'
import { cx } from '../../lib/format'

interface Item {
  id: string
  group: 'Pages' | 'Farms' | 'Actions'
  label: string
  hint?: string
  icon: React.ReactNode
  run: () => void
  score?: number | null
}

export default function CommandPalette({ open, onClose, onTour }: { open: boolean; onClose: () => void; onTour: () => void }) {
  const navigate = useNavigate()
  const { farms } = useFarms()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => {
      navigate(to)
      onClose()
    }
    const pages: Item[] = [
      { id: 'p-home', group: 'Pages', label: 'Home', hint: 'g h', icon: <Home size={15} />, run: go('/') },
      { id: 'p-farms', group: 'Pages', label: 'Farms', hint: 'g f', icon: <Sprout size={15} />, run: go('/farms') },
      { id: 'p-map', group: 'Pages', label: 'Live map', hint: 'g m', icon: <MapPinned size={15} />, run: go('/map') },
      { id: 'p-lenders', group: 'Pages', label: 'Lender view', hint: 'g l', icon: <Landmark size={15} />, run: go('/lenders') },
      { id: 'p-how', group: 'Pages', label: 'How it works', hint: 'g w', icon: <BookOpen size={15} />, run: go('/how-it-works') },
      { id: 'p-register', group: 'Pages', label: 'Register a farm', hint: 'g r', icon: <PlusCircle size={15} />, run: go('/register') },
    ]
    const farmItems: Item[] = (farms ?? []).map(f => ({
      id: f.id,
      group: 'Farms',
      label: f.name,
      hint: `${f.owner} · ${f.district}`,
      icon: <Compass size={15} />,
      score: f.score?.terra_score ?? null,
      run: go(`/farms/${f.id}`),
    }))
    const actions: Item[] = [
      {
        id: 'a-tour',
        group: 'Actions',
        label: 'Start the guided tour',
        hint: '?',
        icon: <Sparkles size={15} />,
        run: () => {
          onClose()
          setTimeout(onTour, 150)
        },
      },
    ]
    return [...pages, ...farmItems, ...actions]
  }, [farms, navigate, onClose, onTour])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.label.toLowerCase().includes(q) || i.hint?.toLowerCase().includes(q) || i.group.toLowerCase().includes(q))
  }, [items, query])

  useEffect(() => {
    if (open) {
      setQuery('')
      setIndex(0)
      setTimeout(() => inputRef.current?.focus(), 30)
    }
  }, [open])

  useEffect(() => {
    setIndex(0)
  }, [query])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setIndex(i => Math.min(filtered.length - 1, i + 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setIndex(i => Math.max(0, i - 1))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        filtered[index]?.run()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, filtered, index, onClose])

  const groups: Item['group'][] = ['Pages', 'Farms', 'Actions']
  let running = -1

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[1350] flex items-start justify-center px-4 pt-[12vh]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            data-tour="palette"
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-paper shadow-[var(--shadow-float)]"
            initial={{ y: -12, scale: 0.98, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: -8, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
              <Search size={16} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Jump to a page or a farm…"
                className="flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted/70"
              />
              <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px] text-muted">esc</kbd>
            </div>
            <div className="scrollbar-thin max-h-[52vh] overflow-y-auto p-2">
              {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted">Nothing matches “{query}”.</div>}
              {groups.map(group => {
                const list = filtered.filter(i => i.group === group)
                if (!list.length) return null
                return (
                  <div key={group} className="mb-1">
                    <div className="overline px-3 pb-1 pt-2">{group}</div>
                    {list.map(item => {
                      running += 1
                      const i = running
                      const active = i === index
                      const band = bandFor(item.score)
                      return (
                        <button
                          key={item.id}
                          onMouseEnter={() => setIndex(i)}
                          onClick={item.run}
                          className={cx('flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors', active ? 'bg-olive text-cream' : 'text-ink hover:bg-sand')}
                        >
                          <span className={cx('flex h-7 w-7 items-center justify-center rounded-lg', active ? 'bg-cream/15' : 'bg-sand')}>{item.icon}</span>
                          <span className="flex-1">
                            <span className="font-medium">{item.label}</span>
                            {item.hint && <span className={cx('ml-2 text-xs', active ? 'text-cream/70' : 'text-muted')}>{item.hint}</span>}
                          </span>
                          {item.score != null && (
                            <span className="rounded-full px-2 py-0.5 font-mono text-xs font-semibold" style={{ background: active ? 'rgba(247,241,229,0.15)' : band?.soft, color: active ? '#f7f1e5' : band?.color }}>
                              {item.score}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div className="flex items-center gap-4 border-t border-line px-5 py-2.5 text-[11px] text-muted">
              <span>
                <kbd className="font-mono">↑↓</kbd> move
              </span>
              <span>
                <kbd className="font-mono">↵</kbd> open
              </span>
              <span>
                <kbd className="font-mono">g</kbd> + letter jumps anywhere
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
