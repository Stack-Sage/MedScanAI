export async function sendGeminiRequest(body) {
   const API_KEY = 'AIzaSyADau_pOUDW2Z_2boidsFy9IjE2F-smnCo';


  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  return await response.json();
}
