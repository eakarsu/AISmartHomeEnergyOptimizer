import { IoLeaf } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'source', label: 'Source' },
  { key: 'emission_kg', label: 'Emission (kg)' },
  { key: 'offset_kg', label: 'Offset (kg)' },
  { key: 'net_emission_kg', label: 'Net (kg)' },
  { key: 'category', label: 'Category' },
  { key: 'date_recorded', label: 'Date' },
]

const formFields = [
  { key: 'source', label: 'Source', type: 'text' },
  { key: 'emission_kg', label: 'Emission (kg)', type: 'number' },
  { key: 'offset_kg', label: 'Offset (kg)', type: 'number' },
  { key: 'net_emission_kg', label: 'Net Emission (kg)', type: 'number' },
  { key: 'category', label: 'Category', type: 'select', options: ['electricity', 'heating', 'renewable', 'transportation', 'water_heating', 'cooking', 'recreation', 'backup_power', 'laundry'] },
  { key: 'date_recorded', label: 'Date', type: 'date' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

export default function CarbonTrackingPage() {
  return <FeaturePage title="Carbon Tracking" icon={IoLeaf} apiEndpoint="/carbon-tracking" columns={columns} formFields={formFields} aiEndpoint="/carbon-tracking/analyze" aiButtonLabel="AI Analysis" />
}
