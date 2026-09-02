import type { ReactNode } from 'react'
import { motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1] as const

export function Reveal({ children, delay = 0, y = 18, className, once = true }: { children: ReactNode; delay?: number; y?: number; className?: string; once?: boolean }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount: 0.2 }}
      transition={{ duration: 0.65, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

export function Stagger({ children, className, gap = 0.08, delay = 0 }: { children: ReactNode; className?: string; gap?: number; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.15 }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap, delayChildren: delay } } }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } } }}>
      {children}
    </motion.div>
  )
}
