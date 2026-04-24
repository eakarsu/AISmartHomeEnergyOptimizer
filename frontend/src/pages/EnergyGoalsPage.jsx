import { IoRibbon } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'goal_name', label: 'Goal' },
  { key: 'target_value', label: 'Target' },
  { key: 'current_value', label: 'Current' },
  { key: 'unit', label: 'Unit' },
  { key: 'progress_pct', label: 'Progress %' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'goal_name', label: 'Goal Name', type: 'text' },
  { key: 'target_value', label: 'Target Value', type: 'number' },
  { key: 'current_value', label: 'Current Value', type: 'number' },
  { key: 'unit', label: 'Unit', type: 'text' },
  { key: 'category', label: 'Category', type: 'select', options: ['electricity', 'solar', 'carbon', 'demand', 'ev_charging', 'cost_savings', 'battery', 'efficiency', 'electrification', 'automation', 'load_shifting', 'gas', 'solar_export', 'hvac', 'lighting'] },
  { key: 'start_date', label: 'Start Date', type: 'date' },
  { key: 'end_date', label: 'End Date', type: 'date' },
]

export default function EnergyGoalsPage() {
  return <FeaturePage title="Energy Goals" icon={IoRibbon} apiEndpoint="/energy-goals" columns={columns} formFields={formFields} />
}
