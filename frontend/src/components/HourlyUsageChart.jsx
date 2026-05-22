import React, { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'
import api from '../services/api'

export default function HourlyUsageChart() {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.get('/custom-views/hourly-usage')
      .then((r) => {
        if (!alive) return
        setData(r.data.points || [])
        setMeta({ generated_at: r.data.generated_at, base: r.data.base_per_hour_kwh })
      })
      .catch((e) => alive && setErr(e.response?.data?.error || e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  return (
    <div style={{ background: '#1c1f2b', border: '1px solid #2c3142', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#f5f7ff' }}>Hourly Energy Usage (last 24 h)</h3>
      {loading && <div style={{ color: '#8b8fa3' }}>Loading...</div>}
      {err && <div style={{ color: '#f87171' }}>Error: {err}</div>}
      {!loading && !err && (
        <>
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2c3142" />
                <XAxis dataKey="hour_label" stroke="#8b8fa3" />
                <YAxis stroke="#8b8fa3" />
                <Tooltip contentStyle={{ background: '#0e1018', border: '1px solid #2c3142', color: '#f5f7ff' }} />
                <Legend />
                <Line type="monotone" dataKey="kwh" stroke="#fbbf24" strokeWidth={2} dot={false} name="kWh" />
                <Line type="monotone" dataKey="cost_usd" stroke="#34d399" strokeWidth={2} dot={false} name="Cost ($)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          {meta && (
            <div style={{ fontSize: 12, color: '#8b8fa3', marginTop: 8 }}>
              Base avg: {meta.base} kWh/hr · generated {new Date(meta.generated_at).toLocaleString()}
            </div>
          )}
        </>
      )}
    </div>
  )
}
