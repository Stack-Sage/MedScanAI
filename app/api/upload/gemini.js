// Security note: No hard-coded Gemini API key in repo. Key is taken from env.
// Using NEXT_PUBLIC_GEMINI_KEY exposes the key to the browser bundle. Prefer GEMINI_API_KEY server-side.
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
  const API_KEY = "AIzaSyADau_pOUDW2Z_2boidsFy9IjE2F-smnCo"
  

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    console.log('Gemini response:', json);
    if (!response.ok || json.error) {
      return { error: json.error?.message || `Gemini HTTP ${response.status}` };
    }
    return json;
  } catch (e) {
    return { error: 'Gemini request failed' };
  }
}
