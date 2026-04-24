import React, { useState, useEffect } from 'react'
import { IoSparkles, IoInformationCircle } from 'react-icons/io5'

function parseAIContent(text) {
  if (!text) return []

  const sections = []
  const lines = text.split('\n')
  let currentSection = { title: '', items: [] }

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    // Headers (## or ### or **)
    if (trimmed.startsWith('### ') || trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      if (currentSection.title || currentSection.items.length > 0) {
        sections.push({ ...currentSection })
      }
      currentSection = { title: trimmed.replace(/^#+\s*/, '').replace(/\*\*/g, ''), items: [] }
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      if (currentSection.title || currentSection.items.length > 0) {
        sections.push({ ...currentSection })
      }
      currentSection = { title: trimmed.replace(/\*\*/g, ''), items: [] }
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.match(/^\d+\.\s/)) {
      const content = trimmed.replace(/^[-*]\s+/, '').replace(/^\d+\.\s+/, '')
      currentSection.items.push({ type: 'bullet', text: formatInlineText(content) })
    } else {
      currentSection.items.push({ type: 'text', text: formatInlineText(trimmed) })
    }
  }

  if (currentSection.title || currentSection.items.length > 0) {
    sections.push(currentSection)
  }

  return sections
}

function formatInlineText(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
}

export default function AIResultDisplay({ result, onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  if (!result) return null

  const content = result.content || result.analysis || result.optimization || result.schedule || result.advice || result.arbitrage || result.message || ''
  const model = result.model || ''
  const usage = result.usage || null
  const sections = parseAIContent(typeof content === 'string' ? content : JSON.stringify(content, null, 2))

  return (
    <div className={`ai-result-display ${visible ? 'ai-result-visible' : ''}`}>
      <div className="ai-result-header">
        <IoSparkles className="ai-result-icon" />
        <h3>AI Analysis Result</h3>
      </div>

      <div className="ai-result-body">
        {sections.length > 0 ? (
          sections.map((section, idx) => (
            <div key={idx} className="ai-section">
              {section.title && <h4 className="ai-section-title">{section.title}</h4>}
              <div className="ai-section-content">
                {section.items.map((item, i) => (
                  item.type === 'bullet' ? (
                    <div key={i} className="ai-bullet">
                      <span className="ai-bullet-dot" />
                      <span dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  ) : (
                    <p key={i} className="ai-text" dangerouslySetInnerHTML={{ __html: item.text }} />
                  )
                ))}
              </div>
            </div>
          ))
        ) : (
          <p className="ai-text">{typeof content === 'string' ? content : JSON.stringify(content, null, 2)}</p>
        )}
      </div>

      {(model || usage) && (
        <div className="ai-result-footer">
          <IoInformationCircle />
          {model && <span>Model: {model}</span>}
          {usage && (
            <span>Tokens: {usage.prompt_tokens || 0} in / {usage.completion_tokens || 0} out / {usage.total_tokens || 0} total</span>
          )}
        </div>
      )}

      <button className="btn btn-secondary" onClick={onClose} style={{ marginTop: '1rem' }}>
        Close Analysis
      </button>
    </div>
  )
}
