import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { IoFlag, IoCheckmarkCircle, IoWarning, IoRefresh } from 'react-icons/io5'
import api from '../services/api'

const STATUS_CONFIG = {
  completed: { color: '#22c55e', label: 'Completed', icon: IoCheckmarkCircle },
  on_track: { color: '#3b82f6', label: 'On Track', icon: IoFlag },
  at_risk: { color: '#f59e0b', label: 'At Risk', icon: IoWarning },
  overdue: { color: '#ef4444', label: 'Overdue', icon: IoWarning },
}

export default function GoalProgressBars() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.get('/energy-goals/progress')
      setData(res.data)
    } catch (err) {
      toast.error('Failed to load goal progress')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (loading) return <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading goals...</div>
  if (!data) return null

  const { goals, summary } = data

  return (
    <div className="card" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
        <IoFlag color="#3b82f6" size={20} />
        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Energy Goals Progress</h3>
        <button onClick={load} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
          <IoRefresh size={16} />
        </button>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {Object.entries({ completed: summary?.completed, on_track: summary?.on_track, at_risk: summary?.at_risk, overdue: summary?.overdue }).map(([key, val]) => {
          const cfg = STATUS_CONFIG[key]
          if (!val) return null
          return (
            <span key={key} style={{ fontSize: '0.75rem', padding: '2px 10px', borderRadius: '100px', background: cfg.color + '20', color: cfg.color, border: `1px solid ${cfg.color}40` }}>
              {val} {cfg.label}
            </span>
          )
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {goals.map((goal) => {
          const cfg = STATUS_CONFIG[goal.derived_status] || STATUS_CONFIG.on_track
          const StatusIcon = cfg.icon
          return (
            <div key={goal.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <StatusIcon size={14} color={cfg.color} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{goal.goal_name}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({goal.category})</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: cfg.color }}>{goal.progress_pct}%</span>
              </div>
              <div style={{ background: 'var(--bg-secondary, #e2e8f0)', borderRadius: '100px', height: '8px', overflow: 'hidden' }}>
                <div style={{ width: `${Math.min(100, goal.progress_pct)}%`, height: '100%', borderRadius: '100px', background: cfg.color, transition: 'width 0.5s ease' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {goal.actual_value?.toFixed(1)} / {goal.target_value} {goal.unit}
                </span>
                {goal.end_date && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due: {goal.end_date}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {goals.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>No active goals found.</p>
      )}
    </div>
  )
}
