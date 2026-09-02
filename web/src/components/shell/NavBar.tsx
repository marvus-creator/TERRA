import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { Command, Sparkles } from 'lucide-react'
import Logo from './Logo'
import Button from '../ui/Button'
import { cx } from '../../lib/format'

export const NAV_LINKS = [
  { to: '/', label: 'Home', key: 'h' },
  { to: '/farms', label: 'Farms', key: 'f' },
  { to: '/map', label: 'Map', key: 'm' },
  { to: '/lenders', label: 'Lenders', key: 'l' },
  { to: '/how-it-works', label: 'How it works', key: 'w' },
]

export default function NavBar({ onPalette, onTour }: { onPalette: () => void; onTour: () => void }) {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-[1100] border-b border-line/70 bg-cream/85 backdrop-blur-md" data-tour="nav">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6">
        <NavLink to="/" className="focus-ring flex items-center gap-2.5 rounded-full">
          <Logo size={30} />
          <span className="font-display text-[22px] font-semibold tracking-[0.12em] text-olive">TERRA</span>
        </NavLink>
        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(link => {
            const active = link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={cx('focus-ring relative rounded-full px-3.5 py-2 text-sm transition-colors', active ? 'text-olive' : 'text-muted hover:text-olive')}
              >
                {link.label}
                {active && (
                  <motion.span layoutId="nav-underline" className="absolute inset-x-3 -bottom-[1px] h-[2px] rounded-full bg-terracotta" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                )}
              </NavLink>
            )
          })}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onPalette}
            className="focus-ring hidden h-9 items-center gap-2 rounded-full border border-line bg-paper px-3 text-xs text-muted transition-colors hover:border-olive-3 hover:text-olive sm:flex"
            aria-label="Open jump palette"
          >
            <Command size={13} />
            <span>Jump to…</span>
            <kbd className="rounded-md border border-line bg-sand px-1.5 py-0.5 font-mono text-[10px] text-muted">Ctrl K</kbd>
          </button>
          <button
            onClick={onTour}
            className="focus-ring hidden h-9 w-9 items-center justify-center rounded-full border border-line bg-paper text-muted transition-colors hover:border-olive-3 hover:text-olive sm:flex"
            aria-label="Start guided tour"
            title="Guided tour (?)"
          >
            <Sparkles size={15} />
          </button>
          <Button to="/register" variant="accent" size="sm" className="h-9">
            Register a farm
          </Button>
        </div>
      </nav>
    </header>
  )
}
