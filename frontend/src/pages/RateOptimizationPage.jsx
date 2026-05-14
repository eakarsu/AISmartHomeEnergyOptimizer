import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IoCash, IoSparkles } from 'react-icons/io5'
import api from '../services/api'
import AIResultDisplay from '../components/AIResultDisplay'

export default function RateOptimizationPage() {
  const [horizonDays, setHorizonDays] = useState(7)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/ai/rate-optimization', { horizon_days: Number(horizonDays) })
      setResult(res.data)
      toast.success('Rate optimization generated')
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.error || err.response?.data?.message || 'Optimization failed'
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
          <IoCash className="page-icon" />
          <h1>Rate Optimization</h1>
        </div>
        <p className="page-subtitle">Shift flexible loads to the cheapest TOU windows.</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Horizon (days, 1-30)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={horizonDays}
            onChange={(e) => setHorizonDays(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <IoSparkles /> {loading ? 'Optimizing…' : 'Run Optimization'}
        </button>
      </form>

      {loading && <div className="loading">Optimizing TOU schedule…</div>}

      {result && (
        <AIResultDisplay
          result={{ content: result.optimization, model: result.model, usage: result.usage }}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
