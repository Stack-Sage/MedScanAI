export async function sendGeminiRequest(body) {
  const API_KEY = process.env.NEXT_PUBLIC_GEMINI_KEY;
  if (!API_KEY) return { error: 'Missing Gemini API key' };
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    return await response.json();
  } catch (e) {
    return { error: 'Gemini request failed' };
  }
}
