import { IoSunny } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'panel_name', label: 'Panel' },
  { key: 'capacity_kw', label: 'Capacity (kW)' },
  { key: 'current_output_kw', label: 'Output (kW)' },
  { key: 'efficiency_pct', label: 'Efficiency %' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'panel_name', label: 'Panel Name', type: 'text' },
  { key: 'capacity_kw', label: 'Capacity (kW)', type: 'number' },
  { key: 'current_output_kw', label: 'Current Output (kW)', type: 'number' },
  { key: 'efficiency_pct', label: 'Efficiency (%)', type: 'number' },
  { key: 'installation_date', label: 'Installation Date', type: 'date' },
  { key: 'location', label: 'Location', type: 'text' },
]

export default function SolarPanelPage() {
  return <FeaturePage title="Solar Panels" icon={IoSunny} apiEndpoint="/solar-panels" columns={columns} formFields={formFields} aiEndpoint="/solar-panels/optimize" aiButtonLabel="AI Optimize" />
}
