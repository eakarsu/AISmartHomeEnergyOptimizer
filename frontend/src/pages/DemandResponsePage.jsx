import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IoFlash, IoSparkles } from 'react-icons/io5'
import api from '../services/api'
import AIResultDisplay from '../components/AIResultDisplay'

export default function DemandResponsePage() {
  const [eventWindow, setEventWindow] = useState('')
  const [eventSeverity, setEventSeverity] = useState('standard')
  const [incentive, setIncentive] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = {
        event_window: eventWindow || undefined,
        event_severity: eventSeverity || undefined,
      }
      if (incentive !== '') payload.expected_incentive_usd = Number(incentive)
      const res = await api.post('/ai/demand-response-automation', payload)
      setResult(res.data)
      toast.success('DR plan generated')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.error || err.response?.data?.message || 'Plan failed'
      if (status === 503) {
        toast.error('AI service unavailable: ' + msg)
      } else {
        toast.error(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <IoFlash className="page-icon" />
          <h1>Demand Response Automation</h1>
        </div>
        <p className="page-subtitle">Plan automated load curtailment for utility DR events.</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Event Window (e.g. 2026-05-09 16:00-19:00)</label>
          <input
            type="text"
            value={eventWindow}
            onChange={(e) => setEventWindow(e.target.value)}
            placeholder="YYYY-MM-DD HH:MM-HH:MM"
          />
        </div>
        <div className="form-group">
          <label>Event Severity</label>
          <select value={eventSeverity} onChange={(e) => setEventSeverity(e.target.value)}>
            <option value="standard">Standard</option>
            <option value="emergency">Emergency</option>
            <option value="economic">Economic</option>
          </select>
        </div>
        <div className="form-group">
          <label>Expected Incentive (USD)</label>
          <input
            type="number"
            step="0.01"
            value={incentive}
            onChange={(e) => setIncentive(e.target.value)}
            placeholder="optional"
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <IoSparkles /> {loading ? 'Planning…' : 'Generate DR Plan'}
        </button>
      </form>

      {loading && <div className="loading">Generating demand response plan…</div>}

      {result && (
        <AIResultDisplay
          result={{ content: result.plan, model: result.model, usage: result.usage }}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
