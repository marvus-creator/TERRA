import { cx } from '../../lib/format'

export default function Logo({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cx('shrink-0', className)} aria-hidden>
      <defs>
        <linearGradient id="logo-ramp" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#7a4a1f" />
          <stop offset="0.5" stopColor="#e6c94a" />
          <stop offset="1" stopColor="#1c5c30" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill="#2f3a1f" />
      <path d="M16 44 L30 20 L48 27 L42 48 Z" fill="url(#logo-ramp)" />
      <path d="M12 14 Q34 34 54 54" stroke="#f7f1e5" strokeWidth="1.5" fill="none" strokeDasharray="3 3" opacity="0.7" />
      <circle cx="50" cy="15" r="4" fill="#f7f1e5" />
    </svg>
  )
}
