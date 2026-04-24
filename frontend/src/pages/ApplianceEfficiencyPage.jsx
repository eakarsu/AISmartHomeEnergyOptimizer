import { IoHardwareChip } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'appliance_name', label: 'Appliance' },
  { key: 'brand', label: 'Brand' },
  { key: 'energy_rating', label: 'Rating' },
  { key: 'annual_consumption_kwh', label: 'Annual kWh' },
  { key: 'age_years', label: 'Age (yrs)' },
  { key: 'category', label: 'Category' },
]

const formFields = [
  { key: 'appliance_name', label: 'Appliance Name', type: 'text' },
  { key: 'brand', label: 'Brand', type: 'text' },
  { key: 'model', label: 'Model', type: 'text' },
  { key: 'energy_rating', label: 'Energy Rating', type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'B+', 'C', 'D'] },
  { key: 'annual_consumption_kwh', label: 'Annual Consumption (kWh)', type: 'number' },
  { key: 'age_years', label: 'Age (years)', type: 'number' },
  { key: 'category', label: 'Category', type: 'select', options: ['kitchen', 'laundry', 'whole_house', 'utility', 'outdoor', 'living_room', 'garage', 'basement'] },
  { key: 'replacement_cost', label: 'Replacement Cost ($)', type: 'number' },
]

export default function ApplianceEfficiencyPage() {
  return <FeaturePage title="Appliance Efficiency" icon={IoHardwareChip} apiEndpoint="/appliances" columns={columns} formFields={formFields} aiEndpoint="/appliances/advise" aiButtonLabel="AI Advice" />
}
