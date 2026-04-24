import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  IoFlash, IoSunny, IoBatteryHalf, IoCash, IoCar, IoLeaf,
  IoThermometer, IoHardwareChip, IoWifi, IoReceipt,
  IoBuild, IoRibbon, IoNotifications, IoDocumentText, IoSparkles,
  IoTrendingDown, IoTrendingUp
} from 'react-icons/io5'
import { getAll } from '../services/api'

const features = [
  { path: '/energy-consumption', label: 'Energy Consumption', icon: IoFlash, desc: 'AI-powered consumption analysis & optimization', ai: true, endpoint: '/energy-consumption', color: '#f59e0b' },
  { path: '/solar-panels', label: 'Solar Panels', icon: IoSunny, desc: 'Solar output optimization & positioning', ai: true, endpoint: '/solar-panels', color: '#eab308' },
  { path: '/batteries', label: 'Battery Management', icon: IoBatteryHalf, desc: 'Smart charge/discharge cycle optimization', ai: true, endpoint: '/batteries', color: '#22c55e' },
  { path: '/utility-rates', label: 'Utility Rates', icon: IoCash, desc: 'Rate arbitrage & cost optimization', ai: true, endpoint: '/utility-rates', color: '#06b6d4' },
  { path: '/ev-charging', label: 'EV Charging', icon: IoCar, desc: 'Intelligent EV charging scheduling', ai: true, endpoint: '/ev-charging', color: '#8b5cf6' },
  { path: '/carbon-tracking', label: 'Carbon Tracking', icon: IoLeaf, desc: 'Carbon footprint analysis & reduction', ai: true, endpoint: '/carbon-tracking', color: '#10b981' },
  { path: '/thermostats', label: 'Thermostats', icon: IoThermometer, desc: 'AI temperature & comfort optimization', ai: true, endpoint: '/thermostats', color: '#ef4444' },
  { path: '/appliances', label: 'Appliance Efficiency', icon: IoHardwareChip, desc: 'Efficiency advice & replacement analysis', ai: true, endpoint: '/appliances', color: '#f97316' },
  { path: '/devices', label: 'Device Management', icon: IoWifi, desc: 'Manage all smart home devices', ai: false, endpoint: '/devices', color: '#64748b' },
  { path: '/billing', label: 'Billing & Payments', icon: IoReceipt, desc: 'Track utility bills & payments', ai: false, endpoint: '/billing', color: '#78716c' },
  { path: '/maintenance', label: 'Maintenance', icon: IoBuild, desc: 'Schedule & track device maintenance', ai: false, endpoint: '/maintenance', color: '#a1a1aa' },
  { path: '/energy-goals', label: 'Energy Goals', icon: IoRibbon, desc: 'Set & monitor energy saving goals', ai: false, endpoint: '/energy-goals', color: '#2dd4bf' },
  { path: '/notifications', label: 'Notifications', icon: IoNotifications, desc: 'System alerts & notifications', ai: false, endpoint: '/notifications', color: '#fb923c' },
  { path: '/usage-reports', label: 'Usage Reports', icon: IoDocumentText, desc: 'Historical usage & analytics', ai: false, endpoint: '/usage-reports', color: '#94a3b8' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [counts, setCounts] = useState({})

  useEffect(() => {
    getAll('/dashboard').then(r => setStats(r.data)).catch(() => {})

    features.forEach(f => {
      getAll(f.endpoint).then(r => {
        const data = Array.isArray(r.data) ? r.data : r.data.data || []
        setCounts(prev => ({ ...prev, [f.endpoint]: data.length }))
      }).catch(() => {})
    })
  }, [])

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1><IoFlash /> Energy Dashboard</h1>
        <p>AI-powered smart home energy management</p>
      </div>

      {stats && (
        <div className="stats-bar">
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#f59e0b' }}><IoFlash /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total_consumption_kwh?.toLocaleString() || 0}</span>
              <span className="stat-label">Total kWh</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#eab308' }}><IoSunny /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total_solar_output_kw?.toFixed(1) || 0}</span>
              <span className="stat-label">Solar kW</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#22c55e' }}><IoBatteryHalf /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.avg_battery_level?.toFixed(0) || 0}%</span>
              <span className="stat-label">Battery Avg</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#10b981' }}><IoLeaf /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.total_carbon_footprint_kg?.toFixed(0) || 0}</span>
              <span className="stat-label">Carbon kg</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#64748b' }}><IoWifi /></div>
            <div className="stat-info">
              <span className="stat-value">{stats.active_devices || 0}</span>
              <span className="stat-label">Devices Online</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ color: '#06b6d4' }}><IoCash /></div>
            <div className="stat-info">
              <span className="stat-value">${stats.monthly_cost?.toFixed(2) || '0.00'}</span>
              <span className="stat-label">Monthly Cost</span>
            </div>
          </div>
        </div>
      )}

      <div className="feature-cards-grid">
        {features.map(f => (
          <div key={f.path} className={`feature-card ${f.ai ? 'ai-card' : ''}`} onClick={() => navigate(f.path)}>
            {f.ai && <div className="ai-badge"><IoSparkles /> AI</div>}
            <div className="feature-card-icon" style={{ color: f.color }}>
              <f.icon />
            </div>
            <h3>{f.label}</h3>
            <p>{f.desc}</p>
            <div className="feature-card-footer">
              <span className="item-count-badge">{counts[f.endpoint] || 0} items</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
