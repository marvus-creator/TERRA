import type { ReactNode } from 'react'
import CountUp from '../reactbits/CountUp'
import { cx } from '../../lib/format'

interface Props {
  label: string
  value: number | null | undefined
  suffix?: string
  prefix?: string
  decimals?: number
  hint?: string
  icon?: ReactNode
  className?: string
  size?: 'md' | 'lg'
}

export default function Stat({ label, value, suffix, prefix, decimals = 0, hint, icon, className, size = 'md' }: Props) {
  const ready = value != null
  return (
    <div className={cx('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2 text-muted">
        {icon}
        <span className="overline">{label}</span>
      </div>
      <div className={cx('font-display font-medium text-olive tabular-nums', size === 'lg' ? 'text-5xl md:text-6xl' : 'text-3xl')}>
        {ready ? (
          <>
            {prefix}
            <CountUp to={decimals ? Number(value.toFixed(decimals)) : Math.round(value)} duration={1.4} separator="," />
            {decimals > 0 && <span className="sr-only">{value.toFixed(decimals)}</span>}
            {suffix && <span className="ml-1 text-[0.5em] text-muted">{suffix}</span>}
          </>
        ) : (
          <span className="skeleton inline-block h-[0.9em] w-20 align-middle" />
        )}
      </div>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}
