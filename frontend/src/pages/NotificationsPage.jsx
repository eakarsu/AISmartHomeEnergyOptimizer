import { IoNotifications } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'type', label: 'Type' },
  { key: 'priority', label: 'Priority' },
  { key: 'is_read', label: 'Read' },
  { key: 'source', label: 'Source' },
  { key: 'created_at', label: 'Date' },
]

const formFields = [
  { key: 'title', label: 'Title', type: 'text' },
  { key: 'message', label: 'Message', type: 'textarea' },
  { key: 'type', label: 'Type', type: 'select', options: ['alert', 'warning', 'info', 'success'] },
  { key: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'] },
  { key: 'source', label: 'Source', type: 'text' },
]

export default function NotificationsPage() {
  return <FeaturePage title="Notifications" icon={IoNotifications} apiEndpoint="/notifications" columns={columns} formFields={formFields} />
}
