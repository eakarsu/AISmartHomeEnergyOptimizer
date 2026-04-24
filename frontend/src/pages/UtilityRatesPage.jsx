import { IoCash } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'provider_name', label: 'Provider' },
  { key: 'rate_type', label: 'Rate Type' },
  { key: 'rate_per_kwh', label: '$/kWh' },
  { key: 'off_peak_rate', label: 'Off-Peak $/kWh' },
  { key: 'region', label: 'Region' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'provider_name', label: 'Provider', type: 'text' },
  { key: 'rate_type', label: 'Rate Type', type: 'select', options: ['Fixed', 'Variable', 'Time-of-Use', 'Tiered', 'Real-Time Pricing'] },
  { key: 'rate_per_kwh', label: 'Rate per kWh ($)', type: 'number' },
  { key: 'peak_hours', label: 'Peak Hours', type: 'text' },
  { key: 'off_peak_rate', label: 'Off-Peak Rate ($)', type: 'number' },
  { key: 'time_of_use', label: 'Time of Use Plan', type: 'text' },
  { key: 'region', label: 'Region', type: 'text' },
]

export default function UtilityRatesPage() {
  return <FeaturePage title="Utility Rates" icon={IoCash} apiEndpoint="/utility-rates" columns={columns} formFields={formFields} aiEndpoint="/utility-rates/arbitrage" aiButtonLabel="AI Arbitrage" />
}
