import { IoCar } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'vehicle_name', label: 'Vehicle' },
  { key: 'battery_capacity_kwh', label: 'Battery (kWh)' },
  { key: 'current_charge_pct', label: 'Charge %' },
  { key: 'target_charge_pct', label: 'Target %' },
  { key: 'departure_time', label: 'Departure' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'vehicle_name', label: 'Vehicle Name', type: 'text' },
  { key: 'battery_capacity_kwh', label: 'Battery Capacity (kWh)', type: 'number' },
  { key: 'current_charge_pct', label: 'Current Charge (%)', type: 'number' },
  { key: 'target_charge_pct', label: 'Target Charge (%)', type: 'number' },
  { key: 'charging_speed_kw', label: 'Charging Speed (kW)', type: 'number' },
  { key: 'departure_time', label: 'Departure Time', type: 'time' },
  { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
]

export default function EVChargingPage() {
  return <FeaturePage title="EV Charging" icon={IoCar} apiEndpoint="/ev-charging" columns={columns} formFields={formFields} aiEndpoint="/ev-charging/schedule" aiButtonLabel="AI Schedule" />
}
