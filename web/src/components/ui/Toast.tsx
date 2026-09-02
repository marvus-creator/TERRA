import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, Info, TriangleAlert } from 'lucide-react'

type Kind = 'info' | 'success' | 'error'

interface ToastItem {
  id: number
  kind: Kind
  text: string
}

interface Ctx {
  toast: (text: string, kind?: Kind) => void
}

const ToastContext = createContext<Ctx>({ toast: () => undefined })

export function useToast() {
  return useContext(ToastContext)
}

const icons: Record<Kind, ReactNode> = {
  info: <Info size={16} className="text-olive-3" />,
  success: <CheckCircle2 size={16} className="text-ndvi-4" />,
  error: <TriangleAlert size={16} className="text-terracotta" />,
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const toast = useCallback((text: string, kind: Kind = 'info') => {
    const id = Date.now() + Math.random()
    setItems(prev => [...prev, { id, kind, text }])
    setTimeout(() => setItems(prev => prev.filter(i => i.id !== id)), 3600)
  }, [])
  const value = useMemo(() => ({ toast }), [toast])
  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-6 left-1/2 z-[1400] flex -translate-x-1/2 flex-col items-center gap-2">
        <AnimatePresence>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="pointer-events-auto flex items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-sm text-ink shadow-[var(--shadow-float)]"
            >
              {icons[item.kind]}
              {item.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
