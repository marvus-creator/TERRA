import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Check, PlusCircle } from 'lucide-react'
import FieldMap from '../components/terra/FieldMap'
import { Button, Card, Skeleton } from '../components/ui'
import { useFarm } from '../hooks/useData'
import { farmHectares } from '../lib/score'
import { fmtHa } from '../lib/format'

const NEXT = [
  { t: 'Now', text: 'The engine searches the Sentinel-2 archive for every pass over this exact shape since July 2024.' },
  { t: '2–5 min', text: 'Cloudy and shadowed pixels are masked out scene by scene using the satellite’s own classification layer.' },
  { t: '5–15 min', text: 'Readings are grouped into Season A and B, peaks are measured, and the first TERRA Score is written.' },
  { t: 'Every 5 days', text: 'A new satellite pass lands. The credit file keeps growing for as long as the field is farmed.' },
]

export default function Watching() {
  const { farmId } = useParams()
  const { farm } = useFarm(farmId)
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-olive px-8 py-14 text-center text-cream md:px-16">
        <svg viewBox="0 0 800 300" className="pointer-events-none absolute inset-0 h-full w-full opacity-40" preserveAspectRatio="none">
          <path id="watch-orbit" d="M-50,220 C150,40 650,40 850,220" fill="none" stroke="#f7f1e5" strokeOpacity="0.25" strokeDasharray="4 8" />
          <g>
            <animateMotion dur="9s" repeatCount="indefinite" rotate="auto">
              <mpath href="#watch-orbit" />
            </animateMotion>
            <rect x="-20" y="-4" width="14" height="8" rx="2" fill="#e6c94a" />
            <rect x="6" y="-4" width="14" height="8" rx="2" fill="#e6c94a" />
            <rect x="-6" y="-6" width="12" height="12" rx="3" fill="#f7f1e5" />
          </g>
        </svg>
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 18 }} className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-ndvi-2 text-olive">
          <span className="pulse-ring !border-ndvi-2" />
          <span className="pulse-ring !border-ndvi-2" style={{ animationDelay: '0.8s' }} />
          <Check size={34} />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display relative mt-6 text-4xl font-medium md:text-6xl">
          The satellite is now watching.
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative mx-auto mt-4 max-w-xl text-cream/75">
          {farm ? (
            <>
              <span className="text-cream">{farm.name}</span> ({fmtHa(farmHectares(farm))}, {farm.district}) is registered. Two years of history are being read from orbit right now.
            </>
          ) : (
            'Your field is registered. Two years of history are being read from orbit right now.'
          )}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Button to={farm ? `/farms/${farm.id}` : '/farms'} variant="accent" size="lg">
            Open the credit file <ArrowRight size={16} />
          </Button>
          <Button to="/register" variant="secondary" size="lg" icon={<PlusCircle size={16} />} className="!border-cream/30 !bg-transparent !text-cream hover:!bg-cream/10">
            Register another
          </Button>
        </motion.div>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1.2fr]">
        {farm ? <FieldMap farm={farm} className="h-[320px]" interactive={false} scanning pad={0.8} /> : <Skeleton className="h-[320px] rounded-3xl" />}
        <Card>
          <div className="overline">What happens next</div>
          <ol className="mt-4 grid gap-4">
            {NEXT.map((n, i) => (
              <motion.li key={n.t} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.15 }} className="grid grid-cols-[84px_1fr] gap-3 text-sm">
                <span className="font-mono text-xs font-semibold text-terracotta">{n.t}</span>
                <span className="text-muted">{n.text}</span>
              </motion.li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
