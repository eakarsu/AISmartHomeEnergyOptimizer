import React, { useEffect, useState } from 'react'
import api from '../services/api'

function colorFor(value, max) {
  if (max <= 0) return '#22273a'
  const t = Math.min(1, value / max)
  // viridis-ish gradient: dark blue -> teal -> yellow
  const r = Math.round(30 + t * 220)
  const g = Math.round(60 + t * 180)
  const b = Math.round(140 - t * 90)
  return `rgb(${r},${g},${b})`
}

export default function DeviceEnergyHeatmap() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    api.get('/custom-views/device-heatmap')
      .then((r) => alive && setData(r.data))
      .catch((e) => alive && setErr(e.response?.data?.error || e.message))
      .finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  return (
    <div style={{ background: '#1c1f2b', border: '1px solid #2c3142', borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h3 style={{ marginTop: 0, color: '#f5f7ff' }}>Device Energy Heatmap (kWh by hour)</h3>
      {loading && <div style={{ color: '#8b8fa3' }}>Loading...</div>}
      {err && <div style={{ color: '#f87171' }}>Error: {err}</div>}
      {!loading && !err && data && (() => {
        const max = Math.max(...data.devices.flatMap((d) => d.hours))
        return (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 720, color: '#dde1ef', fontSize: 11 }}>
              <thead>
                <tr>
                  <th style={{ padding: 6, textAlign: 'left', position: 'sticky', left: 0, background: '#1c1f2b' }}>Device</th>
                  {data.hour_labels.map((h) => (
                    <th key={h} style={{ padding: 4, fontWeight: 400, color: '#8b8fa3' }}>{h.slice(0,2)}</th>
                  ))}
                  <th style={{ padding: 6 }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {data.devices.map((d) => (
                  <tr key={d.device}>
                    <td style={{ padding: 6, position: 'sticky', left: 0, background: '#1c1f2b' }}>{d.device}</td>
                    {d.hours.map((v, i) => (
                      <td key={i} title={`${data.hour_labels[i]} – ${v} kWh`}
                          style={{
                            width: 22, height: 22, padding: 0, textAlign: 'center',
                            background: colorFor(v, max),
                            color: '#0e1018',
                            border: '1px solid #0e1018',
                          }}>
                        {v >= 1 ? v.toFixed(0) : ''}
                      </td>
                    ))}
                    <td style={{ padding: 6, fontVariantNumeric: 'tabular-nums' }}>{d.total_kwh}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 8, fontSize: 11, color: '#8b8fa3' }}>
              Low <span style={{ display: 'inline-block', width: 80, height: 8, marginLeft: 6, marginRight: 6,
                background: 'linear-gradient(to right, rgb(30,60,140), rgb(250,240,50))', borderRadius: 4 }} /> High
            </div>
          </div>
        )
      })()}
    </div>
  )
}
