import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  IoFlash, IoSunny, IoBatteryHalf, IoCash, IoCar, IoLeaf,
  IoThermometer, IoHardwareChip, IoWifi, IoStatsChart, IoReceipt,
  IoBuild, IoRibbon, IoNotifications, IoDocumentText,
  IoLogOut, IoMenu, IoClose, IoHome, IoSparkles, IoCalculator,
  IoAnalytics, IoFlag, IoTrendingUp, IoTime
} from 'react-icons/io5'

const aiFeatures = [
  { path: '/energy-consumption', label: 'Energy Consumption', icon: IoFlash },
  { path: '/solar-panels', label: 'Solar Panels', icon: IoSunny },
  { path: '/batteries', label: 'Battery Management', icon: IoBatteryHalf },
  { path: '/utility-rates', label: 'Utility Rates', icon: IoCash },
  { path: '/ev-charging', label: 'EV Charging', icon: IoCar },
  { path: '/carbon-tracking', label: 'Carbon Tracking', icon: IoLeaf },
  { path: '/thermostats', label: 'Thermostats', icon: IoThermometer },
  { path: '/appliances', label: 'Appliance Efficiency', icon: IoHardwareChip },
  { path: '/consumption-forecast', label: 'Consumption Forecast', icon: IoTrendingUp },
  { path: '/equipment-scheduling', label: 'Equipment Scheduling', icon: IoTime },
  { path: '/solar-forecast', label: 'Solar Forecast', icon: IoSunny },
  { path: '/rate-optimization', label: 'Rate Optimization', icon: IoCash },
  { path: '/battery-optimization', label: 'Battery Optimization', icon: IoBatteryHalf },
  { path: '/demand-response', label: 'Demand Response', icon: IoFlash },
]

const managementFeatures = [
  { path: '/devices', label: 'Device Management', icon: IoWifi },
  { path: '/billing', label: 'Billing', icon: IoReceipt },
  { path: '/maintenance', label: 'Maintenance', icon: IoBuild },
  { path: '/energy-goals', label: 'Energy Goals', icon: IoRibbon },
  { path: '/notifications', label: 'Notifications', icon: IoNotifications },
  { path: '/usage-reports', label: 'Usage Reports', icon: IoDocumentText },
  { path: '/custom-views', label: 'Energy Views', icon: IoStatsChart },
]

const analyticsFeatures = [
  { path: '/bill-simulator', label: 'Bill Simulator', icon: IoCalculator },
  { path: '/energy-timeline', label: 'Energy Timeline', icon: IoAnalytics },
  { path: '/carbon-footprint', label: 'Carbon Footprint', icon: IoLeaf },
]

export default function Layout({ children }) {
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <IoFlash className="sidebar-logo-icon" />
          {sidebarOpen && <span className="sidebar-title">EnergyAI</span>}
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} end>
            <IoHome />
            {sidebarOpen && <span>Dashboard</span>}
          </NavLink>

          {sidebarOpen && <div className="nav-group-label"><IoSparkles /> AI Features</div>}
          {aiFeatures.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <item.icon />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}

          {sidebarOpen && <div className="nav-group-label">Management</div>}
          {managementFeatures.map((item) => (
            <NavLink key={item.path} to={item.path} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <item.icon />
              {sidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="btn-logout" onClick={handleLogout}>
            <IoLogOut />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  )
}
