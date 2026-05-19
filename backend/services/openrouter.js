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
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
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
    return {
      success: true,
      content: data.choices[0]?.message?.content || 'No response generated',
      model: data.model,
      usage: data.usage,
    };
  } catch (error) {
    console.error('OpenRouter API Error:', error.message);
    return {
      success: false,
      content: `AI service error: ${error.message}`,
      model: OPENROUTER_MODEL,
      usage: null,
    };
  }
}

module.exports = { queryAI, parseAIJson };
