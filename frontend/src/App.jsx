import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import EnergyConsumptionPage from './pages/EnergyConsumptionPage'
import SolarPanelPage from './pages/SolarPanelPage'
import BatteryManagementPage from './pages/BatteryManagementPage'
import UtilityRatesPage from './pages/UtilityRatesPage'
import EVChargingPage from './pages/EVChargingPage'
import CarbonTrackingPage from './pages/CarbonTrackingPage'
import ThermostatPage from './pages/ThermostatPage'
import ApplianceEfficiencyPage from './pages/ApplianceEfficiencyPage'
import DeviceManagementPage from './pages/DeviceManagementPage'
import BillingPage from './pages/BillingPage'
import MaintenancePage from './pages/MaintenancePage'
import EnergyGoalsPage from './pages/EnergyGoalsPage'
import NotificationsPage from './pages/NotificationsPage'
import UsageReportsPage from './pages/UsageReportsPage'

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

export default function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/energy-consumption" element={<ProtectedRoute><EnergyConsumptionPage /></ProtectedRoute>} />
        <Route path="/solar-panels" element={<ProtectedRoute><SolarPanelPage /></ProtectedRoute>} />
        <Route path="/batteries" element={<ProtectedRoute><BatteryManagementPage /></ProtectedRoute>} />
        <Route path="/utility-rates" element={<ProtectedRoute><UtilityRatesPage /></ProtectedRoute>} />
        <Route path="/ev-charging" element={<ProtectedRoute><EVChargingPage /></ProtectedRoute>} />
        <Route path="/carbon-tracking" element={<ProtectedRoute><CarbonTrackingPage /></ProtectedRoute>} />
        <Route path="/thermostats" element={<ProtectedRoute><ThermostatPage /></ProtectedRoute>} />
        <Route path="/appliances" element={<ProtectedRoute><ApplianceEfficiencyPage /></ProtectedRoute>} />
        <Route path="/devices" element={<ProtectedRoute><DeviceManagementPage /></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute><BillingPage /></ProtectedRoute>} />
        <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
        <Route path="/energy-goals" element={<ProtectedRoute><EnergyGoalsPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/usage-reports" element={<ProtectedRoute><UsageReportsPage /></ProtectedRoute>} />
      </Routes>
    </>
  )
}
