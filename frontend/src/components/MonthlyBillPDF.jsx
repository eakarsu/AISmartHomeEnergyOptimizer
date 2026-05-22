import React, { useState } from 'react'
import api from '../services/api'

function defaultMonth() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function MonthlyBillPDF() {
  const [month, setMonth] = useState(defaultMonth())
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const download = async () => {
    setBusy(true)
    setMsg('')
    try {
      const res = await api.get(`/custom-views/monthly-bill-pdf?month=${encodeURIComponent(month)}`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `monthly-bill-${month}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMsg(`Downloaded monthly-bill-${month}.pdf`)
    } catch (e) {
      setMsg('Failed: ' + (e.response?.data?.error || e.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={{ background: '#1c1f2b', border: '1px solid #2c3142', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#f5f7ff' }}>Monthly Bill (PDF)</h3>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ color: '#dde1ef' }}>
          Month{' '}
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ background: '#0e1018', color: '#f5f7ff', border: '1px solid #2c3142', padding: 6, borderRadius: 4 }}
          />
        </label>
        <button
          onClick={download}
          disabled={busy}
          style={{
            background: '#fbbf24', color: '#0e1018', border: 'none',
            padding: '8px 14px', borderRadius: 4, cursor: busy ? 'wait' : 'pointer', fontWeight: 600,
          }}
        >
          {busy ? 'Generating...' : 'Download PDF'}
        </button>
      </div>
      {msg && <div style={{ marginTop: 8, color: msg.startsWith('Failed') ? '#f87171' : '#34d399' }}>{msg}</div>}
    </div>
  )
}
