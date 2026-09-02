import type { HTMLAttributes } from 'react'
import { cx } from '../../lib/format'

interface Props extends HTMLAttributes<HTMLDivElement> {
  tone?: 'paper' | 'sand' | 'dark' | 'outline'
  padded?: boolean
  hover?: boolean
}

const tones = {
  paper: 'paper',
  sand: 'bg-sand border border-line',
  dark: 'bg-olive text-cream border border-olive-2 shadow-[var(--shadow-float)]',
  outline: 'border border-dashed border-line bg-transparent',
}

export default function Card({ tone = 'paper', padded = true, hover = false, className, children, ...rest }: Props) {
  return (
    <div
      className={cx(
        'rounded-3xl',
        tones[tone],
        padded && 'p-6',
        hover && 'transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
