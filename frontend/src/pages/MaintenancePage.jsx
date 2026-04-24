import { IoBuild } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'device_name', label: 'Device' },
  { key: 'task_type', label: 'Task Type' },
  { key: 'scheduled_date', label: 'Scheduled' },
  { key: 'priority', label: 'Priority' },
  { key: 'assigned_to', label: 'Assigned To' },
  { key: 'status', label: 'Status' },
]

const formFields = [
  { key: 'device_name', label: 'Device Name', type: 'text' },
  { key: 'task_type', label: 'Task Type', type: 'select', options: ['filter_replacement', 'cleaning', 'firmware_update', 'inspection', 'anode_rod_check', 'calibration', 'battery_replacement', 'winterization', 'annual_service', 'electrical_inspection', 'network_optimization', 'lubrication', 'belt_inspection', 'repair', 'replacement'] },
  { key: 'description', label: 'Description', type: 'textarea' },
  { key: 'scheduled_date', label: 'Scheduled Date', type: 'date' },
  { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
  { key: 'assigned_to', label: 'Assigned To', type: 'text' },
  { key: 'cost_usd', label: 'Cost (USD)', type: 'number' },
]

export default function MaintenancePage() {
  return <FeaturePage title="Maintenance" icon={IoBuild} apiEndpoint="/maintenance" columns={columns} formFields={formFields} />
}
