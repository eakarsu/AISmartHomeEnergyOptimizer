import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { IoFlash, IoRefresh } from 'react-icons/io5'
import api from '../services/api'

export default function CostSummaryCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/energy-consumption/cost-summary')
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load cost summary')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return (
    <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
      <IoRefresh className="spin" size={24} />
      <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Loading cost summary...</p>
    </div>
  )

  if (!data) return null

  const { summary, totals, avg_rate_per_kwh } = data

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <IoFlash color="#f59e0b" size={20} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Cost Summary by Category</h3>
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <IoRefresh size={16} />
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ background: 'var(--bg-secondary, #f8fafc)', padding: '0.75rem', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total kWh</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)' }}>{(totals?.total_kwh || 0).toFixed(1)}</p>
        </div>
        <div style={{ background: 'var(--bg-secondary, #f8fafc)', padding: '0.75rem', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Cost</p>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#22c55e' }}>${(totals?.total_cost_usd || 0).toFixed(2)}</p>
        </div>
      </div>

      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
        Rate: ${avg_rate_per_kwh}/kWh
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {(summary || []).map((row) => (
          <div key={row.category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: 'var(--bg-secondary, #f8fafc)', borderRadius: '6px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{row.category}</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>${row.total_cost_usd.toFixed(2)}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{row.total_kwh.toFixed(1)} kWh</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
