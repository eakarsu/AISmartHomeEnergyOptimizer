import React from 'react'
import FormattedAIReport from './FormattedAIReport'

export default function AIResultDisplay({ result, onClose }) {
  if (result === null || result === undefined) return null
  return <div className="ai-result-display">
    <FormattedAIReport response={result.content ?? result.analysis ?? result.optimization ?? result.schedule ?? result.advice ?? result.arbitrage ?? result.message ?? result} model={result.model} tokens={result.usage} title="AI Analysis Result" />
    <button type="button" className="btn btn-secondary" onClick={onClose}>Close Analysis</button>
  </div>
}
