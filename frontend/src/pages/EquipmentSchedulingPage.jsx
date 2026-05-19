import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IoTime, IoSparkles } from 'react-icons/io5'
import api from '../services/api'
import AIResultDisplay from '../components/AIResultDisplay'

export default function EquipmentSchedulingPage() {
  const [equipment, setEquipment] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const payload = equipment ? { equipment } : {}
      const res = await api.post('/ai/equipment-scheduling', payload)
      setResult(res.data)
      toast.success('Schedule generated')
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Scheduling failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <IoTime className="page-icon" />
          <h1>Equipment Scheduling</h1>
        </div>
        <p className="page-subtitle">Load-shifting recommendations using utility rates.</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Equipment (optional)</label>
          <input
            type="text"
            placeholder="e.g. EV charger, dishwasher, pool pump"
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <IoSparkles /> {loading ? 'Optimizing…' : 'Generate Schedule'}
        </button>
      </form>

      {loading && <div className="loading">Optimizing schedule…</div>}

      {result && (
        <AIResultDisplay
          result={{ content: result.scheduling, model: result.model, usage: result.usage }}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
