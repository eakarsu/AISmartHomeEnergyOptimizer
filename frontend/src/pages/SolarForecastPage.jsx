import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IoSunny, IoSparkles } from 'react-icons/io5'
import api from '../services/api'
import AIResultDisplay from '../components/AIResultDisplay'

export default function SolarForecastPage() {
  const [daysAhead, setDaysAhead] = useState(5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)
    try {
      const res = await api.post('/ai/solar-forecast', { days_ahead: Number(daysAhead) })
      setResult(res.data)
      toast.success('Solar forecast generated')
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Forecast failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feature-page">
      <div className="page-header">
        <div className="page-title">
          <IoSunny className="page-icon" />
          <h1>Solar Forecast</h1>
        </div>
        <p className="page-subtitle">Predict solar generation for the next N days.</p>
      </div>

      <form onSubmit={handleSubmit} className="ai-form" style={{ marginBottom: '1.5rem' }}>
        <div className="form-group">
          <label>Days Ahead (1-14)</label>
          <input
            type="number"
            min="1"
            max="14"
            value={daysAhead}
            onChange={(e) => setDaysAhead(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <IoSparkles /> {loading ? 'Forecasting…' : 'Run Forecast'}
        </button>
      </form>

      {loading && <div className="loading">Generating forecast…</div>}

      {result && (
        <AIResultDisplay
          result={{ content: result.forecast, model: result.model, usage: result.usage }}
          onClose={() => setResult(null)}
        />
      )}
    </div>
  )
}
