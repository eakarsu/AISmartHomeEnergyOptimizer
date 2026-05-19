import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { IoCalculator, IoSparkles, IoTrendingUp, IoTrendingDown, IoRemove } from 'react-icons/io5'
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../services/api'

const TREND_ICONS = {
  increasing: { icon: IoTrendingUp, color: '#ef4444', label: 'Increasing' },
  stable: { icon: IoRemove, color: '#f59e0b', label: 'Stable' },
  decreasing: { icon: IoTrendingDown, color: '#22c55e', label: 'Decreasing' },
}

export default function BillSimulatorPage() {
  const [monthsAhead, setMonthsAhead] = useState(3)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const simulate = async () => {
    setLoading(true)
    try {
      const res = await api.post('/ai/bill-simulate', { months_ahead: monthsAhead })
      setResult(res.data)
      toast.success('Bill simulation complete')
    } catch (err) {
      toast.error('Simulation failed: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const forecast = result?.forecast?.forecast || []
  const trendConfig = result?.forecast?.trend ? TREND_ICONS[result.forecast.trend] : null
  const TrendIcon = trendConfig?.icon

  const chartData = forecast.map((m) => ({
    month: m.month,
    cost: parseFloat(m.estimated_cost_usd) || 0,
    kwh: parseFloat(m.estimated_kwh) || 0,
  }))

  return (
    <div className="page-container" style={{ padding: '1.5rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <IoCalculator size={28} color="#8b5cf6" />
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>Bill Simulator</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            AI-powered energy bill forecast based on your usage patterns
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Forecast Period (months)
          </label>
          <select
            value={monthsAhead}
            onChange={(e) => setMonthsAhead(parseInt(e.target.value))}
            style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          >
            {[1, 2, 3, 6, 12].map((m) => <option key={m} value={m}>{m} month{m > 1 ? 's' : ''}</option>)}
          </select>
        </div>
        <button
          onClick={simulate}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.6rem 1.25rem', borderRadius: '8px',
            background: '#8b5cf6', color: '#fff', border: 'none', cursor: 'pointer',
            fontWeight: 600, opacity: loading ? 0.7 : 1,
          }}
        >
          <IoSparkles />
          {loading ? 'Simulating...' : 'Run AI Simulation'}
        </button>
      </div>

      {loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid #8b5cf6', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>AI is analyzing your usage patterns...</p>
        </div>
      )}

      {result && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Forecast Cost</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#8b5cf6' }}>
                ${(result.forecast?.total_estimated_cost_usd || 0).toFixed(2)}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>over {monthsAhead} months</p>
            </div>
            <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Monthly</p>
              <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
                {(result.forecast?.average_monthly_kwh || 0).toFixed(0)} kWh
              </p>
            </div>
            {trendConfig && (
              <div className="card" style={{ padding: '1rem', textAlign: 'center' }}>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Usage Trend</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <TrendIcon size={24} color={trendConfig.color} />
                  <span style={{ fontSize: '1rem', fontWeight: 700, color: trendConfig.color }}>{trendConfig.label}</span>
                </div>
              </div>
            )}
          </div>

          {/* Monthly cost bar chart */}
          {chartData.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Forecasted Monthly Bills</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val, name) => [name === 'cost' ? `$${val.toFixed(2)}` : `${val.toFixed(0)} kWh`, name === 'cost' ? 'Est. Cost' : 'Est. kWh']}
                    contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }}
                  />
                  <Bar dataKey="cost" fill="#8b5cf6" name="cost" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Monthly kWh line chart */}
          {chartData.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Forecasted kWh Usage</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg)', border: '1px solid var(--border)' }} />
                  <Line type="monotone" dataKey="kwh" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4 }} name="kWh" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Month breakdown table */}
          {forecast.length > 0 && (
            <div className="card" style={{ padding: '1.25rem', overflowX: 'auto' }}>
              <h3 style={{ margin: '0 0 1rem', fontSize: '1rem', fontWeight: 600 }}>Month-by-Month Breakdown</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Month</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Est. kWh</th>
                    <th style={{ textAlign: 'right', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Est. Cost</th>
                    <th style={{ textAlign: 'center', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Confidence</th>
                    <th style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-muted)', fontWeight: 600 }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 500 }}>{m.month}</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right' }}>{parseFloat(m.estimated_kwh || 0).toFixed(0)}</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'right', color: '#8b5cf6', fontWeight: 600 }}>${parseFloat(m.estimated_cost_usd || 0).toFixed(2)}</td>
                      <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: '100px', fontSize: '0.75rem',
                          background: m.confidence === 'high' ? '#22c55e20' : m.confidence === 'medium' ? '#f59e0b20' : '#ef444420',
                          color: m.confidence === 'high' ? '#22c55e' : m.confidence === 'medium' ? '#f59e0b' : '#ef4444',
                        }}>
                          {m.confidence}
                        </span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{m.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Cost saving tips */}
          {result.forecast?.cost_saving_tips?.length > 0 && (
            <div className="card" style={{ padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 600 }}>Cost Saving Tips</h3>
              <ul style={{ margin: 0, padding: '0 0 0 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {result.forecast.cost_saving_tips.map((tip, i) => (
                  <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Summary */}
          {result.forecast?.summary && (
            <div className="card" style={{ padding: '1.25rem', background: '#8b5cf610', border: '1px solid #8b5cf630' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)' }}>{result.forecast.summary}</p>
            </div>
          )}
        </div>
      )}

      {!result && !loading && (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <IoCalculator size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
          <p style={{ color: 'var(--text-muted)' }}>Select a forecast period and click "Run AI Simulation" to get your bill forecast</p>
        </div>
      )}
    </div>
  )
}
