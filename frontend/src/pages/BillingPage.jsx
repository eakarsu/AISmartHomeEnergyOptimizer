import { IoReceipt } from 'react-icons/io5'
import FeaturePage from '../components/FeaturePage'

const columns = [
  { key: 'billing_period', label: 'Period' },
  { key: 'provider', label: 'Provider' },
  { key: 'amount_usd', label: 'Amount ($)' },
  { key: 'kwh_used', label: 'kWh Used' },
  { key: 'due_date', label: 'Due Date' },
  { key: 'payment_status', label: 'Status' },
]

const formFields = [
  { key: 'billing_period', label: 'Billing Period', type: 'text' },
  { key: 'provider', label: 'Provider', type: 'text' },
  { key: 'amount_usd', label: 'Amount (USD)', type: 'number' },
  { key: 'kwh_used', label: 'kWh Used', type: 'number' },
  { key: 'due_date', label: 'Due Date', type: 'date' },
  { key: 'payment_status', label: 'Payment Status', type: 'select', options: ['paid', 'pending', 'overdue'] },
  { key: 'payment_method', label: 'Payment Method', type: 'text' },
  { key: 'notes', label: 'Notes', type: 'textarea' },
]

export default function BillingPage() {
  return <FeaturePage title="Billing & Payments" icon={IoReceipt} apiEndpoint="/billing" columns={columns} formFields={formFields} />
}
