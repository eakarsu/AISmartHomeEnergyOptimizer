import React, { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { IoAdd, IoSparkles, IoRefresh } from 'react-icons/io5'
import { getAll, create, update, remove, runAI } from '../services/api'
import Modal from './Modal'
import DetailPanel from './DetailPanel'
import AIResultDisplay from './AIResultDisplay'

export default function FeaturePage({ title, icon: Icon, apiEndpoint, columns, formFields, aiEndpoint, aiButtonLabel }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [aiResult, setAiResult] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [formData, setFormData] = useState({})

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAll(apiEndpoint)
      setItems(Array.isArray(res.data) ? res.data : res.data.data || [])
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [apiEndpoint])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      await create(apiEndpoint, formData)
      toast.success('Item created successfully')
      setShowAddModal(false)
      setFormData({})
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create item')
    }
  }

  const handleEdit = async (updatedData) => {
    const id = updatedData._id || updatedData.id
    try {
      await update(apiEndpoint, id, updatedData)
      toast.success('Item updated successfully')
      setSelectedItem(null)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update item')
    }
  }

  const handleDelete = async (id) => {
    try {
      await remove(apiEndpoint, id)
      toast.success('Item deleted successfully')
      setSelectedItem(null)
      fetchItems()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete item')
    }
  }

  const handleAI = async () => {
    setAiLoading(true)
    setAiResult(null)
    try {
      const res = await runAI(aiEndpoint)
      setAiResult(res.data)
      toast.success('AI analysis complete')
    } catch (err) {
      toast.error(err.response?.data?.message || 'AI analysis failed')
    } finally {
      setAiLoading(false)
    }
  }

  const handleFormChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const renderFormField = (field) => {
    const value = formData[field.key] !== undefined ? formData[field.key] : ''

    if (field.type === 'select') {
      return (
        <div key={field.key} className="form-group">
          <label>{field.label}</label>
          <select value={value} onChange={(e) => handleFormChange(field.key, e.target.value)} required>
            <option value="">Select {field.label}...</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="form-group">
          <label>{field.label}</label>
          <textarea
            value={value}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            rows={3}
            placeholder={`Enter ${field.label.toLowerCase()}...`}
          />
        </div>
      )
    }

    return (
      <div key={field.key} className="form-group">
        <label>{field.label}</label>
        <input
          type={field.type || 'text'}
          value={value}
          onChange={(e) => handleFormChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
          placeholder={`Enter ${field.label.toLowerCase()}...`}
          step={field.type === 'number' ? 'any' : undefined}
        />
      </div>
    )
  }

  const formatCellValue = (value) => {
    if (value === true) return 'Yes'
    if (value === false) return 'No'
    if (value === null || value === undefined) return '-'
    if (typeof value === 'number') return value.toLocaleString()
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString()
    }
    return String(value)
  }

  return (
    <div className="feature-page">
      <div className="feature-page-header">
        <div className="feature-title">
          {Icon && <Icon className="feature-icon" />}
          <h1>{title}</h1>
          <span className="item-count">{items.length} items</span>
        </div>
        <div className="feature-actions">
          <button className="btn btn-secondary" onClick={fetchItems}>
            <IoRefresh /> Refresh
          </button>
          {aiEndpoint && (
            <button className="btn btn-ai" onClick={handleAI} disabled={aiLoading}>
              <IoSparkles /> {aiLoading ? 'Analyzing...' : (aiButtonLabel || 'AI Analysis')}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => { setFormData({}); setShowAddModal(true) }}>
            <IoAdd /> Add New
          </button>
        </div>
      </div>

      {aiResult && (
        <AIResultDisplay result={aiResult} onClose={() => setAiResult(null)} />
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading data...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state">
          <p>No items found. Click "Add New" to create one.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={item._id || item.id || idx} onClick={() => setSelectedItem(item)} className="clickable-row">
                  {columns.map((col) => (
                    <td key={col.key}>
                      {col.key === 'status' ? (
                        <span className={`status-badge status-${(item[col.key] || 'unknown').toLowerCase()}`}>
                          {item[col.key] || 'N/A'}
                        </span>
                      ) : (
                        formatCellValue(item[col.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={`Add New ${title}`}>
        <form onSubmit={handleAdd} className="modal-form">
          {formFields.map(renderFormField)}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} title="Item Details" wide>
        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            columns={columns}
            formFields={formFields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </Modal>
    </div>
  )
}
