import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { CircleMarker, MapContainer, Polygon, Polyline, TileLayer, useMapEvents } from 'react-leaflet'
import { ArrowLeft, ArrowRight, Check, Eraser, MousePointerClick, Satellite, Undo2 } from 'lucide-react'
import { registerFarm } from '../api'
import FieldMap, { ESRI_ATTR, ESRI_URL } from '../components/terra/FieldMap'
import { Button, Card, PageHeader, useToast } from '../components/ui'
import { hectaresOf } from '../lib/score'
import { cx, fmtHa } from '../lib/format'
import type { Farm } from '../types'

type Point = [number, number]

const DISTRICTS = ['Bugesera', 'Nyagatare', 'Gatsibo', 'Kayonza', 'Kirehe', 'Ngoma', 'Rwamagana', 'Musanze', 'Huye', 'Rubavu', 'Nyanza', 'Gisagara']
const STEPS = ['Details', 'Draw the field', 'Confirm']

function ClickCapture({ onAdd }: { onAdd: (p: Point) => void }) {
  useMapEvents({ click: e => onAdd([e.latlng.lat, e.latlng.lng]) })
  return null
}

function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string | null; children: React.ReactNode }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-olive">{label}</span>
      {children}
      {error ? <span className="text-[11px] text-terracotta">{error}</span> : hint ? <span className="text-[11px] text-muted">{hint}</span> : null}
    </label>
  )
}

const inputCls = 'focus-ring h-11 rounded-xl border border-line bg-paper px-4 text-sm text-ink outline-none placeholder:text-muted/60 focus:border-olive-3'

export default function Register() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [owner, setOwner] = useState('')
  const [district, setDistrict] = useState('Bugesera')
  const [points, setPoints] = useState<Point[]>([])
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const area = hectaresOf(points)
  const nameErr = name.trim().length < 2 ? 'Give the farm a name of at least 2 characters.' : null
  const ownerErr = owner.trim().length < 2 ? 'Who farms this field?' : null
  const detailsOk = !nameErr && !ownerErr
  const shapeOk = points.length >= 3 && area >= 0.05
  const shapeMsg = points.length < 3 ? `Place ${3 - points.length} more corner${3 - points.length === 1 ? '' : 's'}` : area < 0.05 ? 'That shape is smaller than 0.05 ha — zoom in and redraw' : area > 200 ? 'That is very large for one field — double-check the corners' : 'Shape looks good'

  const preview = useMemo<Farm | null>(() => {
    if (points.length < 3) return null
    const ring = points.map(([lat, lon]) => [lon, lat])
    ring.push(ring[0])
    return { id: 'preview', name: name || 'New field', owner, district, geometry: { type: 'Polygon', coordinates: [ring] }, registered: new Date().toISOString(), seasons: [], score: null, status: 'analyzing' }
  }, [points, name, owner, district])

  async function submit() {
    if (!detailsOk || !shapeOk || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const ring = points.map(([lat, lon]) => [lon, lat])
      ring.push(ring[0])
      const farm = await registerFarm({ name: name.trim(), owner: owner.trim(), district: district.trim() || 'Bugesera', geometry: { type: 'Polygon', coordinates: [ring] } })
      toast('Field registered — the satellite is now watching', 'success')
      navigate(`/register/watching/${farm.id}`)
    } catch (e) {
      setError(String(e))
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <PageHeader overline="Onboarding" title="Register a farm in three steps." lede="Details, draw the field on satellite imagery, confirm. The satellites handle everything else — the credit file starts building within minutes." />

      <ol className="mb-8 flex flex-wrap items-center gap-2" data-tour="register-steps">
        {STEPS.map((s, i) => (
          <li key={s} className="flex items-center gap-2">
            <button
              onClick={() => {
                if (i === 0 || (i === 1 && detailsOk) || (i === 2 && detailsOk && shapeOk)) setStep(i)
              }}
              className={cx('focus-ring flex h-9 items-center gap-2 rounded-full border px-3.5 text-sm transition-colors', i === step ? 'border-olive bg-olive text-cream' : i < step ? 'border-ndvi-4/40 bg-[#d3e6d6] text-ndvi-5' : 'border-line bg-paper text-muted')}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-cream/20 font-mono text-[11px]">{i < step ? <Check size={12} /> : i + 1}</span>
              {s}
            </button>
            {i < STEPS.length - 1 && <span className="h-px w-8 bg-line" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card>
              <div className="overline">Step 1</div>
              <h2 className="font-display mt-1 text-2xl text-olive">Who and where</h2>
              <div className="mt-6 grid gap-5">
                <Field label="Farm name" error={touched ? nameErr : null} hint="How the field will appear in the portfolio.">
                  <input value={name} onChange={e => setName(e.target.value)} onBlur={() => setTouched(true)} placeholder="e.g. Kayitesi Maize Field" className={inputCls} />
                </Field>
                <Field label="Owner / farmer name" error={touched ? ownerErr : null}>
                  <input value={owner} onChange={e => setOwner(e.target.value)} onBlur={() => setTouched(true)} placeholder="e.g. Vestine Kayitesi" className={inputCls} />
                </Field>
                <Field label="District" hint="Rwanda’s season calendar (A: Sep–Feb, B: Mar–Jun) is applied nationwide.">
                  <input list="districts" value={district} onChange={e => setDistrict(e.target.value)} className={inputCls} />
                  <datalist id="districts">
                    {DISTRICTS.map(d => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </Field>
              </div>
              <div className="mt-8 flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setTouched(true)
                    if (detailsOk) setStep(1)
                  }}
                >
                  Next: draw the field <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
            <Card tone="sand" className="flex flex-col justify-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-paper text-olive">
                  <Satellite size={18} />
                </span>
                <div className="font-display text-xl text-olive">What TERRA needs from you</div>
              </div>
              <ul className="mt-5 grid gap-3 text-sm text-muted">
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-ndvi-4" /> A name for the field and the farmer who works it.
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-ndvi-4" /> The corners of the field, tapped on a satellite photo.
                </li>
                <li className="flex gap-3">
                  <Check size={16} className="mt-0.5 shrink-0 text-ndvi-4" /> That’s it. No ID scan, no bank statement, no guarantor.
                </li>
              </ul>
              <p className="mt-5 text-xs text-muted">Scores are most reliable for fields of half a hectare or more, because each satellite pixel is 10 × 10 metres.</p>
            </Card>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="relative h-[520px] overflow-hidden rounded-3xl border border-line" data-tour="draw-map">
              <MapContainer center={[-2.1785, 30.0845]} zoom={16} scrollWheelZoom className="h-full w-full">
                <TileLayer url={ESRI_URL} attribution={ESRI_ATTR} maxZoom={18} />
                <ClickCapture onAdd={p => setPoints(prev => [...prev, p])} />
                {points.length >= 2 && points.length < 3 && <Polyline positions={points} pathOptions={{ color: '#e6c94a', weight: 2, dashArray: '6 4' }} />}
                {points.length >= 3 && <Polygon positions={points} pathOptions={{ color: '#fcf9f2', weight: 2.5, fillColor: '#e6c94a', fillOpacity: 0.35 }} />}
                {points.map((p, i) => (
                  <CircleMarker key={`${p[0]}-${p[1]}-${i}`} center={p} radius={6} pathOptions={{ color: '#2f3a1f', weight: 2, fillColor: '#e6c94a', fillOpacity: 1 }} />
                ))}
              </MapContainer>
              <div className="pointer-events-none absolute left-4 top-4 z-[500] flex items-center gap-2 rounded-full border border-line bg-paper/95 px-3 py-1.5 text-xs text-olive shadow-[var(--shadow-card)]">
                <MousePointerClick size={14} /> Tap each corner of the field
              </div>
              <div className="absolute bottom-4 left-4 z-[500] rounded-2xl border border-line bg-paper/95 px-4 py-3 shadow-[var(--shadow-card)]">
                <div className="overline">Live area</div>
                <div className="font-display text-3xl text-olive">{area > 0 ? fmtHa(area) : '— ha'}</div>
              </div>
            </div>
            <Card className="flex flex-col">
              <div className="overline">Step 2</div>
              <h2 className="font-display mt-1 text-2xl text-olive">Draw {name.trim() || 'the field'}</h2>
              <p className="mt-2 text-sm text-muted">Zoom until you can see the field edges, then tap each corner in order. Three corners make a triangle; add as many as the shape needs.</p>
              <div className="mt-5 rounded-2xl border border-line bg-cream/60 p-4 text-sm">
                <div className="flex justify-between text-muted">
                  <span>Corners placed</span>
                  <span className={cx('font-mono', points.length >= 3 ? 'text-ndvi-5' : 'text-terracotta')}>{points.length}</span>
                </div>
                <div className="mt-2 flex justify-between text-muted">
                  <span>Estimated area</span>
                  <span className="font-mono text-olive">{area > 0 ? fmtHa(area) : '—'}</span>
                </div>
                <div className={cx('mt-3 flex items-center gap-2 text-xs', shapeOk ? 'text-ndvi-5' : 'text-terracotta')}>
                  <span className={cx('h-1.5 w-1.5 rounded-full', shapeOk ? 'bg-ndvi-4' : 'bg-terracotta')} />
                  {shapeMsg}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setPoints(prev => prev.slice(0, -1))} disabled={points.length === 0} icon={<Undo2 size={14} />}>
                  Undo corner
                </Button>
                <Button variant="secondary" size="sm" className="flex-1" onClick={() => setPoints([])} disabled={points.length === 0} icon={<Eraser size={14} />}>
                  Clear
                </Button>
              </div>
              <div className="mt-auto flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setStep(0)} icon={<ArrowLeft size={14} />}>
                  Back
                </Button>
                <Button onClick={() => shapeOk && setStep(2)} disabled={!shapeOk}>
                  Next: confirm <ArrowRight size={14} />
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {step === 2 && preview && (
          <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.25 }} className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <FieldMap farm={preview} className="h-[420px]" interactive={false} pad={0.6} label={`${fmtHa(area)}`} />
            <Card className="flex flex-col">
              <div className="overline">Step 3</div>
              <h2 className="font-display mt-1 text-2xl text-olive">Confirm and hand over to the satellite</h2>
              <dl className="mt-6 grid grid-cols-[130px_1fr] gap-y-3 text-sm">
                <dt className="text-muted">Farm</dt>
                <dd className="font-medium text-olive">{name.trim()}</dd>
                <dt className="text-muted">Owner</dt>
                <dd className="font-medium text-olive">{owner.trim()}</dd>
                <dt className="text-muted">District</dt>
                <dd className="font-medium text-olive">{district.trim() || 'Bugesera'}</dd>
                <dt className="text-muted">Field</dt>
                <dd className="font-medium text-olive">
                  {points.length} corners · {fmtHa(area)}
                </dd>
                <dt className="text-muted">History window</dt>
                <dd className="font-medium text-olive">July 2024 → today, every clear Sentinel-2 pass</dd>
              </dl>
              {error && <div className="mt-4 rounded-xl border border-terracotta/30 bg-terracotta-soft p-3 text-xs text-terracotta">{error}</div>}
              <div className="mt-auto flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setStep(1)} icon={<ArrowLeft size={14} />}>
                  Back
                </Button>
                <Button variant="accent" size="lg" onClick={submit} disabled={submitting} icon={<Satellite size={16} />}>
                  {submitting ? 'Handing over…' : 'Submit for satellite analysis'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
