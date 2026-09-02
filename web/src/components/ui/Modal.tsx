import { useEffect, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { cx } from '../../lib/format'

interface Props {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: string
  side?: boolean
  hideClose?: boolean
}

export default function Modal({ open, onClose, title, children, width = 'max-w-xl', side = false, hideClose = false }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={cx('fixed inset-0 z-[1300] flex', side ? 'justify-end' : 'items-center justify-center p-4')}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal
            className={cx(
              'relative flex w-full flex-col bg-paper text-ink shadow-[var(--shadow-float)]',
              side ? 'h-full max-w-2xl border-l border-line' : cx('max-h-[85vh] rounded-3xl border border-line', width),
            )}
            initial={side ? { x: 40, opacity: 0 } : { y: 16, scale: 0.98, opacity: 0 }}
            animate={side ? { x: 0, opacity: 1 } : { y: 0, scale: 1, opacity: 1 }}
            exit={side ? { x: 40, opacity: 0 } : { y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
          >
            {(title || !hideClose) && (
              <div className="flex items-center justify-between border-b border-line px-6 py-4">
                {title && <h2 className="font-display text-xl text-olive">{title}</h2>}
                {!hideClose && (
                  <button onClick={onClose} className="focus-ring ml-auto rounded-full p-2 text-muted hover:bg-sand hover:text-olive" aria-label="Close">
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
            <div className="scrollbar-thin flex-1 overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
