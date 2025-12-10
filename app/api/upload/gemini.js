export function extractGeminiText(res) {
  if (!res) return '';
  const parts = [];
  if (Array.isArray(res.candidates)) {
    for (const c of res.candidates) {
      const pArr = c?.content?.parts || [];
      for (const p of pArr) {
        if (typeof p.text === 'string') parts.push(p.text);
        else if (typeof p.generatedContent === 'string') parts.push(p.generatedContent);
      }
    }
  }
  return parts.join('\n').trim();
}

export async function sendGeminiRequest(body) {
  // Load API key from environment variable
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  // Debug log for production
  if (!API_KEY) {
    console.error('Gemini API key missing. Check NEXT_PUBLIC_GEMINI_API_KEY in production environment.');
    throw new Error('API key is not set. Please set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local file or production environment.');
  }

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    console.log('Gemini response:', json);
    if (!response.ok || json.error) {
      // Log error for production debugging
      console.error('Gemini API error:', json.error?.message || response.status);
      return { error: json.error?.message || `Gemini HTTP ${response.status}` };
    }
    return json;
  } catch (e) {
    console.error('Gemini request failed:', e);
    return { error: 'Gemini request failed' };
  }
}

