import { IoBatteryHalf } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'battery_name', label: 'Battery' },
  { key: 'capacity_kwh', label: 'Capacity (kWh)' },
  { key: 'current_charge_pct', label: 'Charge %' },
  { key: 'health_pct', label: 'Health %' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'battery_name', label: 'Battery Name', type: 'text' },
  { key: 'capacity_kwh', label: 'Capacity (kWh)', type: 'number' },
  { key: 'current_charge_pct', label: 'Current Charge (%)', type: 'number' },
  { key: 'charge_rate_kw', label: 'Charge Rate (kW)', type: 'number' },
  { key: 'discharge_rate_kw', label: 'Discharge Rate (kW)', type: 'number' },
  { key: 'health_pct', label: 'Health (%)', type: 'number' },
]

export default function BatteryManagementPage() {
  return <FeaturePage title="Battery Management" icon={IoBatteryHalf} apiEndpoint="/batteries" columns={columns} formFields={formFields} aiEndpoint="/batteries/optimize" aiButtonLabel="AI Optimize" />
}
