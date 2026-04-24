import { IoThermometer } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'zone_name', label: 'Zone' },
  { key: 'current_temp_f', label: 'Current °F' },
  { key: 'target_temp_f', label: 'Target °F' },
  { key: 'mode', label: 'Mode' },
  { key: 'humidity_pct', label: 'Humidity %' },
  { key: 'occupancy', label: 'Occupied' },
]

const formFields = [
  { key: 'zone_name', label: 'Zone Name', type: 'text' },
  { key: 'current_temp_f', label: 'Current Temp (°F)', type: 'number' },
  { key: 'target_temp_f', label: 'Target Temp (°F)', type: 'number' },
  { key: 'mode', label: 'Mode', type: 'select', options: ['cooling', 'heating', 'auto', 'off'] },
  { key: 'humidity_pct', label: 'Humidity (%)', type: 'number' },
  { key: 'occupancy', label: 'Occupied', type: 'select', options: ['true', 'false'] },
  { key: 'schedule_start', label: 'Schedule Start', type: 'time' },
  { key: 'schedule_end', label: 'Schedule End', type: 'time' },
]

export default function ThermostatPage() {
  return <FeaturePage title="Smart Thermostats" icon={IoThermometer} apiEndpoint="/thermostats" columns={columns} formFields={formFields} aiEndpoint="/thermostats/optimize" aiButtonLabel="AI Optimize" />
}
