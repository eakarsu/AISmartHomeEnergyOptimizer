require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-3-5-sonnet-20241022';

/**
 * Parse AI response that may be JSON, JSON in markdown fences, or plain text.
 * Returns parsed object or null.
 */
function parseAIJson(raw) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch (_) {}
  const stripped = raw.replace(/```(?:json)?/gi, '').trim();
  try { return JSON.parse(stripped); } catch (_) {}
  const start = stripped.indexOf('{');
  const end = stripped.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    try { return JSON.parse(stripped.slice(start, end + 1)); } catch (_) {}
  }
  return null;
}

async function queryAI(systemPrompt, userMessage) {
  try {
    if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required');
    const baseUrl = (process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1').replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
        'X-Title': 'AI Smart Home Energy Optimizer',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content || !String(content).trim()) throw new Error('OpenRouter returned an empty response');
    return {
      success: true,
      content,
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    throw error;
  }
}

module.exports = { queryAI, parseAIJson };
