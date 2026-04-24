import { IoWifi } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'device_name', label: 'Device' },
  { key: 'device_type', label: 'Type' },
  { key: 'manufacturer', label: 'Manufacturer' },
  { key: 'room', label: 'Room' },
  { key: 'power_consumption_w', label: 'Power (W)' },
  { key: 'is_online', label: 'Online' },
]

const formFields = [
  { key: 'device_name', label: 'Device Name', type: 'text' },
  { key: 'device_type', label: 'Device Type', type: 'select', options: ['thermostat', 'doorbell_camera', 'smart_switch', 'smart_plug', 'security_camera', 'smart_lock', 'smart_speaker', 'hub', 'energy_monitor', 'irrigation_controller', 'garage_controller', 'air_quality_sensor', 'smart_relay'] },
  { key: 'manufacturer', label: 'Manufacturer', type: 'text' },
  { key: 'ip_address', label: 'IP Address', type: 'text' },
  { key: 'firmware_version', label: 'Firmware', type: 'text' },
  { key: 'room', label: 'Room', type: 'text' },
  { key: 'power_consumption_w', label: 'Power (W)', type: 'number' },
]

export default function DeviceManagementPage() {
  return <FeaturePage title="Device Management" icon={IoWifi} apiEndpoint="/devices" columns={columns} formFields={formFields} />
}
