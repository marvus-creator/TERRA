import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { Reading } from '../types'

export default function NdviChart({ readings }: { readings: Reading[] }) {
  const data = readings.map(r => ({ date: r.date, ndvi: Number(r.ndvi_mean) }))
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#4ade80" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#1e2d26" strokeDasharray="3 3" />
        <XAxis dataKey="date" stroke="#7fa08f" tick={{ fontSize: 11 }} minTickGap={40} />
        <YAxis domain={[0, 0.9]} stroke="#7fa08f" tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{
            background: '#0b1210',
            border: '1px solid #1e2d26',
            borderRadius: 12,
            color: '#e8f2ec',
          }}
        />
        <Area type="monotone" dataKey="ndvi" stroke="#4ade80" strokeWidth={2} fill="url(#ndviFill)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
