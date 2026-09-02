const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
const shortFmt = new Intl.DateTimeFormat('en-GB', { month: 'short', year: '2-digit' })

export function fmtDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d)
}

export function fmtMonth(ts: number) {
  return shortFmt.format(new Date(ts))
}

export function fmtHa(ha: number) {
  return `${ha < 10 ? ha.toFixed(2) : ha.toFixed(1)} ha`
}

export function pct(v: number) {
  return `${Math.round(v * 100)}%`
}

export function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
