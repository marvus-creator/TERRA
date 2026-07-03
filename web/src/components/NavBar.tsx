import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Home' },
  { to: '/farms', label: 'Portfolio' },
  { to: '/map', label: 'Live Map' },
  { to: '/how-it-works', label: 'How It Works' },
]

export default function NavBar() {
  return (
    <header className="sticky top-0 z-[1100] border-b border-white/10 bg-[#050807]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <NavLink to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">🛰️</span>
          <span className="text-lg font-extrabold tracking-[0.25em]">TERRA</span>
        </NavLink>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-emerald-400/15 text-emerald-300'
                    : 'text-emerald-100/60 hover:bg-white/5 hover:text-emerald-100'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
        <NavLink
          to="/register"
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-[#04130b] transition-colors hover:bg-emerald-400"
        >
          Register a Farm
        </NavLink>
      </nav>
    </header>
  )
}
