import FormattedAIReport from "../components/FormattedAIReport";
// // === Batch 07 Gaps & Frontend Mounts ===
import React, { useState } from 'react';

export default function GapNoConsumptionforecastPredictEnergyUse() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sampleRequests = [
    {
        "label": "Home scenario",
        "value": "Recent household consumption is 24, 27, 25, 31, 29, 26, and 28 kWh/day. Forecast the next seven days with assumptions for mild weather and identify uncertainty; these are illustrative readings. Return a practical recommendation, assumptions, and missing inputs."
    },
    {
        "label": "Conservative plan",
        "value": "Recent household consumption is 24, 27, 25, 31, 29, 26, and 28 kWh/day. Forecast the next seven days with assumptions for mild weather and identify uncertainty; these are illustrative readings. Prioritize safety and comfort. Include constraints, a cautious schedule, and what must be verified before action."
    },
    {
        "label": "Cost and resilience review",
        "value": "Recent household consumption is 24, 27, 25, 31, 29, 26, and 28 kWh/day. Forecast the next seven days with assumptions for mild weather and identify uncertainty; these are illustrative readings. Compare estimated costs and resilience tradeoffs. Show calculations only where the supplied illustrative data supports them."
    }
];

  const applySampleRequest = (value) => {
    setInput(value);
    setError(null);
  };

  async function run() {
    setLoading(true); setError(null); setOutput(null);
    try {
      const token = (typeof localStorage !== 'undefined' && localStorage.getItem('token')) || '';
      const res = await fetch('/api/gap-no-consumptionforecast-predict-energy-use', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ input }),
      });
      const ct = res.headers.get('content-type') || '';
      const data = ct.includes('json') ? await res.json() : { text: await res.text() };
      if (!res.ok) throw new Error((data && data.error) || res.statusText);
      setOutput(data);
    } catch (e) {
      setError(e && e.message ? e.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>No /consumption-forecast (predict energy use)</h1>
      <p style={{ color: '#666', marginBottom: 16 }}>AISmartHomeEnergyOptimizer - Gap feature</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {sampleRequests.map((sample) => (
            <button
              key={sample.label}
              type="button"
              onClick={() => applySampleRequest(sample.value)}
              style={{ padding: '6px 10px', background: '#eef2ff', color: '#1e3a8a', border: '1px solid #c7d2fe', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
            >
              {sample.label}
            </button>
          ))}
        </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Describe inputs or paste context..."
        style={{ width: '100%', minHeight: 160, padding: 10, border: '1px solid #ddd', borderRadius: 6, fontFamily: 'inherit' }}
      />
      <div style={{ marginTop: 12 }}>
        <button onClick={run} disabled={loading}
          style={{ padding: '8px 16px', background: '#111', color: '#fff', border: 0, borderRadius: 6, cursor: 'pointer' }}>
          {loading ? 'Running...' : 'Run'}
        </button>
      </div>
      {error && (
        <div style={{ marginTop: 16, padding: 12, background: '#fee', color: '#900', borderRadius: 6 }}>{error}</div>
      )}
      {output && (
        <FormattedAIReport response={output} />
      )}
    </div>
  );
}
