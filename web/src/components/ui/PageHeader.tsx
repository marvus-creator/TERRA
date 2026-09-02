import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'motion/react'

interface Crumb {
  to: string
  label: string
}

interface Props {
  overline?: string
  title: ReactNode
  lede?: ReactNode
  crumbs?: Crumb[]
  actions?: ReactNode
  aside?: ReactNode
  tour?: string
}

export default function PageHeader({ overline, title, lede, crumbs, actions, aside, tour }: Props) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-6" data-tour={tour}>
      <div className="max-w-2xl">
        {crumbs && (
          <nav className="mb-3 flex items-center gap-1 text-xs text-muted">
            {crumbs.map((c, i) => (
              <span key={c.to} className="flex items-center gap-1">
                <Link to={c.to} className="hover:text-olive">
                  {c.label}
                </Link>
                {i < crumbs.length - 1 && <ChevronRight size={12} />}
              </span>
            ))}
          </nav>
        )}
        {overline && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="overline">
            {overline}
          </motion.div>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="font-display mt-2 text-4xl font-medium leading-[1.05] text-olive md:text-5xl"
        >
          {title}
        </motion.h1>
        {lede && (
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }} className="mt-3 text-[15px] leading-relaxed text-muted">
            {lede}
          </motion.p>
        )}
      </div>
      {(actions || aside) && (
        <div className="flex flex-wrap items-center gap-3">
          {aside}
          {actions}
        </div>
      )}
    </div>
  )
}
