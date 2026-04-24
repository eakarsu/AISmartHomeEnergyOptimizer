require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5';

async function queryAI(systemPrompt, userMessage) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:3000',
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

module.exports = { queryAI };
