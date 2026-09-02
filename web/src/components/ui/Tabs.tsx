import { motion } from 'motion/react'
import { cx } from '../../lib/format'

interface Tab<T extends string> {
  value: T
  label: string
  count?: number
}

interface Props<T extends string> {
  tabs: Tab<T>[]
  value: T
  onChange: (v: T) => void
  className?: string
  id?: string
}

export default function Tabs<T extends string>({ tabs, value, onChange, className, id = 'tabs' }: Props<T>) {
  return (
    <div className={cx('inline-flex items-center gap-1 rounded-full border border-line bg-sand p-1', className)} role="tablist">
      {tabs.map(tab => {
        const active = tab.value === value
        return (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.value)}
            className={cx(
              'focus-ring relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              active ? 'text-cream' : 'text-muted hover:text-olive',
            )}
          >
            {active && (
              <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-olive" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
            )}
            <span className="relative flex items-center gap-1.5">
              {tab.label}
              {tab.count != null && (
                <span className={cx('rounded-full px-1.5 text-[10px]', active ? 'bg-cream/20' : 'bg-line/60')}>{tab.count}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
