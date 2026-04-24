import { IoDocumentText } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'report_name', label: 'Report' },
  { key: 'report_type', label: 'Type' },
  { key: 'period_start', label: 'Start' },
  { key: 'period_end', label: 'End' },
  { key: 'total_consumption_kwh', label: 'Total kWh' },
  { key: 'total_cost_usd', label: 'Total Cost ($)' },
]

const formFields = [
  { key: 'report_name', label: 'Report Name', type: 'text' },
  { key: 'report_type', label: 'Report Type', type: 'select', options: ['daily', 'weekly', 'monthly', 'quarterly', 'annual', 'solar_monthly', 'ev_monthly', 'ytd'] },
  { key: 'period_start', label: 'Period Start', type: 'date' },
  { key: 'period_end', label: 'Period End', type: 'date' },
  { key: 'total_consumption_kwh', label: 'Total Consumption (kWh)', type: 'number' },
  { key: 'total_cost_usd', label: 'Total Cost (USD)', type: 'number' },
  { key: 'total_solar_kwh', label: 'Total Solar (kWh)', type: 'number' },
  { key: 'total_carbon_kg', label: 'Total Carbon (kg)', type: 'number' },
]

export default function UsageReportsPage() {
  return <FeaturePage title="Usage Reports" icon={IoDocumentText} apiEndpoint="/usage-reports" columns={columns} formFields={formFields} />
}
