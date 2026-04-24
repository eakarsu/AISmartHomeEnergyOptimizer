import React, { useState } from 'react'
import { IoCreate, IoTrash, IoSave, IoClose } from 'react-icons/io5'

export default function DetailPanel({ item, columns, formFields, onEdit, onDelete, onClose }) {
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({ ...item })
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value })
  }

  const handleSave = () => {
    onEdit(formData)
    setEditing(false)
  }

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(item._id || item.id)
      setConfirmDelete(false)
    } else {
      setConfirmDelete(true)
    }
  }

  const renderField = (field) => {
    const value = formData[field.key] !== undefined ? formData[field.key] : ''

    if (!editing) {
      return (
        <div key={field.key} className="detail-field">
          <label>{field.label}</label>
          <span>{String(value)}</span>
        </div>
      )
    }

    if (field.type === 'select') {
      return (
        <div key={field.key} className="detail-field">
          <label>{field.label}</label>
          <select value={value} onChange={(e) => handleChange(field.key, e.target.value)}>
            <option value="">Select...</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )
    }

    if (field.type === 'textarea') {
      return (
        <div key={field.key} className="detail-field">
          <label>{field.label}</label>
          <textarea value={value} onChange={(e) => handleChange(field.key, e.target.value)} rows={3} />
        </div>
      )
    }

    return (
      <div key={field.key} className="detail-field">
        <label>{field.label}</label>
        <input
          type={field.type || 'text'}
          value={value}
          onChange={(e) => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
          step={field.type === 'number' ? 'any' : undefined}
        />
      </div>
    )
  }

  return (
    <div className="detail-panel">
      <div className="detail-panel-header">
        <h3>{editing ? 'Edit Item' : 'Item Details'}</h3>
        <button className="modal-close" onClick={onClose}><IoClose /></button>
      </div>

      <div className="detail-panel-body">
        {formFields.map(renderField)}
      </div>

      <div className="detail-panel-actions">
        {editing ? (
          <>
            <button className="btn btn-success" onClick={handleSave}>
              <IoSave /> Save
            </button>
            <button className="btn btn-secondary" onClick={() => { setEditing(false); setFormData({ ...item }) }}>
              Cancel
            </button>
          </>
        ) : (
          <>
            <button className="btn btn-primary" onClick={() => setEditing(true)}>
              <IoCreate /> Edit
            </button>
            <button className={`btn btn-danger ${confirmDelete ? 'btn-confirm-delete' : ''}`} onClick={handleDelete}>
              <IoTrash /> {confirmDelete ? 'Confirm Delete?' : 'Delete'}
            </button>
          </>
        )}
      </div>

      {confirmDelete && !editing && (
        <div className="delete-warning">
          <p>This action cannot be undone. Click "Confirm Delete?" again to proceed.</p>
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(false)}>Cancel</button>
        </div>
      )}
    </div>
  )
}
