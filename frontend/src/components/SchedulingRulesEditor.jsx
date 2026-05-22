import React, { useEffect, useState } from 'react'
import api from '../services/api'

const blank = {
  device_name: '',
  action: 'on',
  start_time: '08:00',
  end_time: '18:00',
  days_of_week: 'Mon,Tue,Wed,Thu,Fri',
  enabled: true,
  notes: '',
}

export default function SchedulingRulesEditor() {
  const [rules, setRules] = useState([])
  const [draft, setDraft] = useState(blank)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [editingId, setEditingId] = useState(null)

  const refresh = async () => {
    try {
      const r = await api.get('/custom-views/schedules')
      setRules(r.data || [])
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }
  useEffect(() => { refresh() }, [])

  const save = async () => {
    setBusy(true); setErr('')
    try {
      if (editingId) {
        await api.put(`/custom-views/schedules/${editingId}`, draft)
      } else {
        await api.post('/custom-views/schedules', draft)
      }
      setDraft(blank)
      setEditingId(null)
      await refresh()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    } finally {
      setBusy(false)
    }
  }

  const edit = (r) => {
    setEditingId(r.id)
    setDraft({
      device_name: r.device_name,
      action: r.action,
      start_time: (r.start_time || '08:00').slice(0, 5),
      end_time: (r.end_time || '18:00').slice(0, 5),
      days_of_week: r.days_of_week || 'Mon,Tue,Wed,Thu,Fri',
      enabled: !!r.enabled,
      notes: r.notes || '',
    })
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this schedule?')) return
    try {
      await api.delete(`/custom-views/schedules/${id}`)
      await refresh()
    } catch (e) {
      setErr(e.response?.data?.error || e.message)
    }
  }

  const input = (k, type = 'text', extras = {}) => (
    <input
      type={type}
      value={draft[k] ?? ''}
      onChange={(e) => setDraft({ ...draft, [k]: type === 'checkbox' ? e.target.checked : e.target.value })}
      style={{ background: '#0e1018', color: '#f5f7ff', border: '1px solid #2c3142', padding: 6, borderRadius: 4, width: '100%' }}
      {...extras}
    />
  )

  return (
    <div style={{ background: '#1c1f2b', border: '1px solid #2c3142', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#f5f7ff' }}>Device Scheduling Rules</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 2fr 1fr', gap: 8, marginBottom: 8, color: '#dde1ef', fontSize: 13 }}>
        <div>
          <div style={{ color: '#8b8fa3' }}>Device</div>
          {input('device_name')}
        </div>
        <div>
          <div style={{ color: '#8b8fa3' }}>Action</div>
          <select
            value={draft.action}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
            style={{ background: '#0e1018', color: '#f5f7ff', border: '1px solid #2c3142', padding: 6, borderRadius: 4, width: '100%' }}
          >
            <option value="on">on</option>
            <option value="off">off</option>
          </select>
        </div>
        <div>
          <div style={{ color: '#8b8fa3' }}>Start</div>
          {input('start_time', 'time')}
        </div>
        <div>
          <div style={{ color: '#8b8fa3' }}>End</div>
          {input('end_time', 'time')}
        </div>
        <div>
          <div style={{ color: '#8b8fa3' }}>Days</div>
          {input('days_of_week')}
        </div>
        <div>
          <div style={{ color: '#8b8fa3' }}>Enabled</div>
          <label style={{ display: 'inline-flex', alignItems: 'center', height: 30 }}>
            <input
              type="checkbox"
              checked={!!draft.enabled}
              onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })}
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={save}
          disabled={busy || !draft.device_name}
          style={{
            background: '#34d399', color: '#0e1018', border: 'none',
            padding: '8px 14px', borderRadius: 4, fontWeight: 600,
            cursor: busy ? 'wait' : 'pointer',
          }}
        >
          {editingId ? 'Update' : 'Add'} Rule
        </button>
        {editingId && (
          <button onClick={() => { setEditingId(null); setDraft(blank) }} style={{ background: '#2c3142', color: '#f5f7ff', border: 'none', padding: '8px 14px', borderRadius: 4 }}>
            Cancel
          </button>
        )}
      </div>

      {err && <div style={{ color: '#f87171', marginBottom: 8 }}>{err}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', color: '#dde1ef', fontSize: 13 }}>
        <thead>
          <tr style={{ color: '#8b8fa3' }}>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #2c3142' }}>Device</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #2c3142' }}>Action</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #2c3142' }}>Window</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #2c3142' }}>Days</th>
            <th style={{ textAlign: 'left', padding: 6, borderBottom: '1px solid #2c3142' }}>Enabled</th>
            <th style={{ padding: 6, borderBottom: '1px solid #2c3142' }} />
          </tr>
        </thead>
        <tbody>
          {rules.length === 0 && (
            <tr><td colSpan={6} style={{ padding: 12, color: '#8b8fa3' }}>No scheduling rules yet.</td></tr>
          )}
          {rules.map((r) => (
            <tr key={r.id}>
              <td style={{ padding: 6 }}>{r.device_name}</td>
              <td style={{ padding: 6 }}>{r.action}</td>
              <td style={{ padding: 6 }}>{(r.start_time || '').slice(0,5)} – {(r.end_time || '').slice(0,5)}</td>
              <td style={{ padding: 6 }}>{r.days_of_week}</td>
              <td style={{ padding: 6 }}>{r.enabled ? 'Yes' : 'No'}</td>
              <td style={{ padding: 6, textAlign: 'right' }}>
                <button onClick={() => edit(r)} style={{ marginRight: 6, background: '#2c3142', color: '#f5f7ff', border: 'none', padding: '4px 10px', borderRadius: 4 }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ background: '#7f1d1d', color: '#f5f7ff', border: 'none', padding: '4px 10px', borderRadius: 4 }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
