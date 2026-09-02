import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cx } from '../../lib/format'

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'dark'
type Size = 'sm' | 'md' | 'lg'

const base =
  'focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out select-none disabled:cursor-not-allowed disabled:opacity-40 active:scale-[0.98]'

const variants: Record<Variant, string> = {
  primary: 'bg-olive text-cream hover:bg-olive-2 shadow-[0_8px_20px_-10px_rgba(47,58,31,0.6)]',
  secondary: 'bg-paper text-olive border border-line hover:border-olive-3 hover:bg-sand',
  ghost: 'text-olive hover:bg-sand',
  accent: 'bg-terracotta text-cream hover:bg-terracotta-2 shadow-[0_8px_20px_-10px_rgba(196,98,45,0.7)]',
  dark: 'bg-ink text-cream hover:bg-olive',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3.5 text-xs',
  md: 'h-10 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  to?: string
  icon?: ReactNode
}

export default function Button({ variant = 'primary', size = 'md', to, icon, className, children, ...rest }: Props) {
  const cls = cx(base, variants[variant], sizes[size], className)
  if (to) {
    return (
      <Link to={to} className={cls}>
        {icon}
        {children}
      </Link>
    )
  }
  return (
    <button className={cls} {...rest}>
      {icon}
      {children}
    </button>
  )
}
