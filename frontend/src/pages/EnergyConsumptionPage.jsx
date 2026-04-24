import { IoFlash } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'device_name', label: 'Device' },
  { key: 'category', label: 'Category' },
  { key: 'consumption_kwh', label: 'kWh' },
  { key: 'cost_usd', label: 'Cost ($)' },
  { key: 'date_recorded', label: 'Date' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'device_name', label: 'Device Name', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: ['HVAC', 'Lighting', 'Appliance', 'Electronics', 'EV Charging', 'Water Heating', 'Other'] },
  { key: 'consumption_kwh', label: 'Consumption (kWh)', type: 'number' },
  { key: 'cost_usd', label: 'Cost (USD)', type: 'number' },
  { key: 'date_recorded', label: 'Date', type: 'date' },
  { key: 'location', label: 'Location', type: 'text' },
]

export default function EnergyConsumptionPage() {
  return <FeaturePage title="Energy Consumption" icon={IoFlash} apiEndpoint="/energy-consumption" columns={columns} formFields={formFields} aiEndpoint="/energy-consumption/analyze" aiButtonLabel="AI Analysis" />
}
