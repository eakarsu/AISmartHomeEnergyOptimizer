import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { IoLeaf, IoRefresh } from 'react-icons/io5'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../services/api'

const COLORS = ['#ef4444', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6']

export default function CarbonFootprintPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/carbon-tracking/summary')
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load carbon data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const monthly = data?.monthly_breakdown || []
  const monthlyChartData = monthly.map((m) => ({
    month: m.month,
    emission: parseFloat(m.emission_kg) || 0,
    offset: parseFloat(m.offset_kg) || 0,
    net: parseFloat(m.net_emission_kg) || 0,
  }))

  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <IoLeaf size={28} color="#22c55e" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Carbon Footprint Tracker</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track your carbon emissions and offset progress
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', borderRadius: '6px', background: '#22c55e', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          <IoRefresh className={loading ? 'spin' : ''} size={14} /> Refresh
        </button>
      </div>

      {loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading carbon data...</div>
      )}

      {data && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            {[
              { label: 'Total Emissions', value: `${(data.summary?.total_emission_kg || 0).toFixed(1)} kg CO₂`, color: '#ef4444' },
              { label: 'Total Offsets', value: `${(data.summary?.total_offset_kg || 0).toFixed(1)} kg`, color: '#22c55e' },
              { label: 'Net Emissions', value: `${(data.summary?.total_net_emission_kg || 0).toFixed(1)} kg`, color: '#f59e0b' },
              { label: 'Est. from Energy', value: `${(data.summary?.energy_derived_emission_kg || 0).toFixed(1)} kg`, color: '#8b5cf6' },
              { label: 'Trees Equivalent', value: `${data.summary?.carbon_trees_equivalent || 0} trees/yr`, color: '#10b981' },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</p>
                <p style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: s.color, marginTop: '0.25rem' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Carbon factor info */}
          <div className="card" style={{ padding: '1rem', background: '#22c55e10', border: '1px solid #22c55e30' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)' }}>
              Carbon factor: <strong>{data.summary?.carbon_factor_kg_per_kwh} kg CO₂/kWh</strong> (US average grid) ·
              Total energy consumed: <strong>{(data.summary?.total_kwh_consumed || 0).toFixed(1)} kWh</strong>
            </p>
          </div>

          {/* Monthly bar chart */}
          {monthlyChartData.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Monthly Emissions vs Offsets (kg CO₂)</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }} />
                  <Legend />
                  <Bar dataKey="emission" fill="#ef4444" name="Emissions" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="offset" fill="#22c55e" name="Offsets" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="net" fill="#f59e0b" name="Net" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly table */}
          {monthly.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Monthly Breakdown</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    {['Month', 'Emissions (kg)', 'Offsets (kg)', 'Net (kg)'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem', textAlign: h === 'Month' ? 'left' : 'right', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthly.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.5rem' }}>{row.month}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', color: '#ef4444', fontWeight: 500 }}>{parseFloat(row.emission_kg || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', color: '#22c55e', fontWeight: 500 }}>{parseFloat(row.offset_kg || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', color: '#f59e0b', fontWeight: 500 }}>{parseFloat(row.net_emission_kg || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!data && !loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <IoLeaf size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>No carbon tracking data available.</p>
        </div>
      )}
    </div>
  )
}
