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
import BillSimulatorPage from './pages/BillSimulatorPage'
import EnergyTimelinePage from './pages/EnergyTimelinePage'
import CarbonFootprintPage from './pages/CarbonFootprintPage'
import ConsumptionForecastPage from './pages/ConsumptionForecastPage'
import EquipmentSchedulingPage from './pages/EquipmentSchedulingPage'
import SolarForecastPage from './pages/SolarForecastPage'
import RateOptimizationPage from './pages/RateOptimizationPage'
import BatteryOptimizationPage from './pages/BatteryOptimizationPage'
import DemandResponsePage from './pages/DemandResponsePage'

// === Batch 07 Gaps & Frontend Mounts ===
import CfLoadShiftingOptimizer from './pages/CfLoadShiftingOptimizer';
import CfRenewableBatteryCoordination from './pages/CfRenewableBatteryCoordination';
import CfDemandResponseAutomation from './pages/CfDemandResponseAutomation';
import CfApplianceLifetimeOptimization from './pages/CfApplianceLifetimeOptimization';
import CfWholehomeEnergyResilience from './pages/CfWholehomeEnergyResilience';
import CfBehavioralEnergyCoaching from './pages/CfBehavioralEnergyCoaching';
import GapNoConsumptionforecastPredictEnergyUse from './pages/GapNoConsumptionforecastPredictEnergyUse';
import GapNoEquipmentschedulingRunwhencheap from './pages/GapNoEquipmentschedulingRunwhencheap';
import GapNoRateoptimizationLoadShiftingForTou from './pages/GapNoRateoptimizationLoadShiftingForTou';
import GapNoSolarforecastGenerationPrediction from './pages/GapNoSolarforecastGenerationPrediction';
import GapNoBatterymanagementoptimization from './pages/GapNoBatterymanagementoptimization';
import GapNoDemandresponseautomation from './pages/GapNoDemandresponseautomation';
import GapNoSmartDeviceApiIntegrationNestTeslaE from './pages/GapNoSmartDeviceApiIntegrationNestTeslaE';
import GapNoRealtimeMonitoringDashboardBackend from './pages/GapNoRealtimeMonitoringDashboardBackend';
import GapNoUtilitynetmeteringApiIntegration from './pages/GapNoUtilitynetmeteringApiIntegration';
import GapNoLiveSolarMonitoringEnphaseSolaredge from './pages/GapNoLiveSolarMonitoringEnphaseSolaredge';
import GapNoHomeAutomationTriggersScenes from './pages/GapNoHomeAutomationTriggersScenes';
import GapNoPublicWebhooksForGridSignals from './pages/GapNoPublicWebhooksForGridSignals';
// === End Batch 07 ===


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
        <Route path="/bill-simulator" element={<ProtectedRoute><BillSimulatorPage /></ProtectedRoute>} />
        <Route path="/energy-timeline" element={<ProtectedRoute><EnergyTimelinePage /></ProtectedRoute>} />
        <Route path="/carbon-footprint" element={<ProtectedRoute><CarbonFootprintPage /></ProtectedRoute>} />
        <Route path="/consumption-forecast" element={<ProtectedRoute><ConsumptionForecastPage /></ProtectedRoute>} />
        <Route path="/equipment-scheduling" element={<ProtectedRoute><EquipmentSchedulingPage /></ProtectedRoute>} />
        <Route path="/solar-forecast" element={<ProtectedRoute><SolarForecastPage /></ProtectedRoute>} />
        <Route path="/rate-optimization" element={<ProtectedRoute><RateOptimizationPage /></ProtectedRoute>} />
        <Route path="/battery-optimization" element={<ProtectedRoute><BatteryOptimizationPage /></ProtectedRoute>} />
        <Route path="/demand-response" element={<ProtectedRoute><DemandResponsePage /></ProtectedRoute>} />
          // === Batch 07 Gaps & Frontend Mounts ===
          <Route path='/cf-load-shifting-optimizer' element={<CfLoadShiftingOptimizer />} />
          <Route path='/cf-renewable-battery-coordination' element={<CfRenewableBatteryCoordination />} />
          <Route path='/cf-demand-response-automation' element={<CfDemandResponseAutomation />} />
          <Route path='/cf-appliance-lifetime-optimization' element={<CfApplianceLifetimeOptimization />} />
          <Route path='/cf-wholehome-energy-resilience' element={<CfWholehomeEnergyResilience />} />
          <Route path='/cf-behavioral-energy-coaching' element={<CfBehavioralEnergyCoaching />} />
          <Route path='/gap-no-consumptionforecast-predict-energy-use' element={<GapNoConsumptionforecastPredictEnergyUse />} />
          <Route path='/gap-no-equipmentscheduling-runwhencheap' element={<GapNoEquipmentschedulingRunwhencheap />} />
          <Route path='/gap-no-rateoptimization-load-shifting-for-tou' element={<GapNoRateoptimizationLoadShiftingForTou />} />
          <Route path='/gap-no-solarforecast-generation-prediction' element={<GapNoSolarforecastGenerationPrediction />} />
          <Route path='/gap-no-batterymanagementoptimization' element={<GapNoBatterymanagementoptimization />} />
          <Route path='/gap-no-demandresponseautomation' element={<GapNoDemandresponseautomation />} />
          <Route path='/gap-no-smart-device-api-integration-nest-tesla-e' element={<GapNoSmartDeviceApiIntegrationNestTeslaE />} />
          <Route path='/gap-no-realtime-monitoring-dashboard-backend' element={<GapNoRealtimeMonitoringDashboardBackend />} />
          <Route path='/gap-no-utilitynetmetering-api-integration' element={<GapNoUtilitynetmeteringApiIntegration />} />
          <Route path='/gap-no-live-solar-monitoring-enphase-solaredge' element={<GapNoLiveSolarMonitoringEnphaseSolaredge />} />
          <Route path='/gap-no-home-automation-triggers-scenes' element={<GapNoHomeAutomationTriggersScenes />} />
          <Route path='/gap-no-public-webhooks-for-grid-signals' element={<GapNoPublicWebhooksForGridSignals />} />
          // === End Batch 07 ===
      </Routes>
    </>
  )
}
