import React from 'react'
import { sendGeminiRequest } from '../api/upload/gemini'

const Content = () => {

  // Function to generate disease input prompt
  function diseaseFunction(result, disease, description) {
    return {
      content: [
        {
          result,
          disease,
          description,
          questions: [
            'What are the common symptoms of this disease?',
            'What are the primary causes of this disease?',
            'How is this disease typically diagnosed?',
            'What treatment options are available for this disease?'
          ]
        }
      ]
    }
  }

  // Function to prepare final prompt for Gemini API
  function formatForGemini(contentData) {
    const data = contentData.content[0];

    const prompt = `
Patient Report:
Result: ${data.result}
Disease: ${data.disease}
Description: ${data.description}

Provide concise, structured answers with headings to:
${data.questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Constraints:
- 4 Bullet points, short sentences, no fluff.
- Add a brief safety note: this is general information and not medical advice.
- Do NOT provide specific life expectancy; prefer factors influencing outcomes.
    `;

    return { contents: [{ parts: [{ text: prompt }] }] };
  }

  // Main function to call API
  async function getContent(backendResult) {
    if (backendResult?.noDisease) return null; 
    const content = diseaseFunction(
      backendResult?.diagnosis || "Unknown",
      backendResult?.meta?.disease || "Unknown Disease",
      backendResult?.summary || "No description."
    );

    const formattedRequest = formatForGemini(content);

    try {
      const result = await sendGeminiRequest(formattedRequest);
      return result;
    } catch (error) {
      return { error: "Apologies, something went wrong." };
    }
  }

  return { getContent }
}

export default Content;
