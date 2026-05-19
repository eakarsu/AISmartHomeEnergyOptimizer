import React from 'react'
import { IoStatsChart } from 'react-icons/io5'
import HourlyUsageChart from '../components/HourlyUsageChart'
import DeviceEnergyHeatmap from '../components/DeviceEnergyHeatmap'
import MonthlyBillPDF from '../components/MonthlyBillPDF'
import SchedulingRulesEditor from '../components/SchedulingRulesEditor'

export default function CustomViewsPage() {
  return (
    <div style={{ padding: 24, color: '#f5f7ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <IoStatsChart size={28} color="#fbbf24" />
        <h1 style={{ margin: 0 }}>Energy Views</h1>
      </div>
      <p style={{ color: '#8b8fa3', marginTop: 0 }}>
        Visualisations, monthly billing PDF, and device on/off scheduling rules.
      </p>

      <HourlyUsageChart />
      <DeviceEnergyHeatmap />
      <MonthlyBillPDF />
      <SchedulingRulesEditor />
    </div>
  )
}
