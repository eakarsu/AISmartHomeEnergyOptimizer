import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { IoAnalytics, IoRefresh } from 'react-icons/io5'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import api from '../services/api'

const CATEGORIES = ['All', 'HVAC', 'Lighting', 'Appliance', 'Electronics', 'EV Charging', 'Water Heating', 'Other']

export default function EnergyTimelinePage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [days, setDays] = useState(30)
  const [category, setCategory] = useState('All')

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ days })
      if (category !== 'All') params.set('category', category)
      const res = await api.get(`/energy-consumption/timeline?${params}`)
      setData(res.data.timeline || [])
    } catch (err) {
      toast.error('Failed to load timeline')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [days, category])

  const totalKwh = data.reduce((s, d) => s + (d.kwh || 0), 0).toFixed(1)
  const totalCost = data.reduce((s, d) => s + (d.cost || 0), 0).toFixed(2)
  const avgKwh = data.length ? (totalKwh / data.length).toFixed(1) : 0

  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <IoAnalytics size={28} color="#3b82f6" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Energy Timeline</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>Daily energy consumption over time</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={60}>Last 60 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.5rem' }}>Category:</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#3b82f6', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <IoRefresh className={loading ? 'spin' : ''} size={14} /> Refresh
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Total kWh', value: totalKwh, color: '#f59e0b' },
          { label: 'Total Cost', value: `$${totalCost}`, color: '#22c55e' },
          { label: 'Daily Avg kWh', value: avgKwh, color: '#3b82f6' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loading && (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading timeline data...
        </div>
      )}

      {!loading && data.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* kWh line chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Daily kWh Consumption</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }} />
                <Legend />
                <Line type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="kWh" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Cost bar chart */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Daily Cost ($)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val) => [`$${val.toFixed(2)}`, 'Cost']}
                  contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                />
                <Bar dataKey="cost" fill="#22c55e" radius={[3, 3, 0, 0]} name="Cost" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Data table */}
          <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Daily Data</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                  {['Date', 'kWh', 'Cost ($)', 'Records'].map((h) => (
                    <th key={h} style={{ padding: '0.5rem', textAlign: h === 'Date' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.5rem' }}>{row.date}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f59e0b', fontWeight: 500 }}>{row.kwh.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#22c55e', fontWeight: 500 }}>${row.cost.toFixed(2)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: 'var(--text-muted)' }}>{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <IoAnalytics size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No timeline data found for the selected period and category.</p>
        </div>
      )}
    </div>
  )
}
