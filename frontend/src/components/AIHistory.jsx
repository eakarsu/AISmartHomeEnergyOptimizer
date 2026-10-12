import React, { useState } from 'react'
import api, { listRows } from '../services/api'
import FormattedAIReport from './FormattedAIReport'

export default function AIHistory({ endpoint }) {
  const [items, setItems] = useState(null)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get('/ai/results', { params: { limit: 100 } })
      setItems(listRows(response.data).filter(item => item.endpoint === endpoint))
    } catch (err) {
      setError(err.response?.data?.error || 'Saved results could not be loaded.')
    } finally {
      setLoading(false)
    }
  }

  return <section className="ai-history" aria-label="Saved AI results">
    <div className="ai-history-heading"><h2>Saved results</h2><button type="button" className="btn btn-secondary" onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Load saved results'}</button></div>
    {error && <p role="alert">{error}</p>}
    {items?.length === 0 && <p>No saved results found in the most recent 100 results.</p>}
    {items?.map(item => <button type="button" className="ai-history-row" key={item.id} onClick={() => setSelected(item)}><span>{new Date(item.created_at).toLocaleString()}</span><span>View report</span></button>)}
    {selected && <div className="ai-history-detail"><button type="button" className="btn btn-secondary" onClick={() => setSelected(null)}>Close saved report</button><FormattedAIReport response={selected.result} title="Saved AI report" /></div>}
  </section>
}
