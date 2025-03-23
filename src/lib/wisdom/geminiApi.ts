
// Helper function to make a direct API call to Gemini
export async function callGeminiDirectly(prompt: string) {
  // Replace with your Gemini API key - for development and testing only
  // In production, use Supabase Edge Functions with secured API keys
  const DIRECT_GEMINI_API_KEY = 'AIzaSyDFgEV8YgD7CHtKlINtHE2YeAGiNJzCGe4'; 
  
  if (!DIRECT_GEMINI_API_KEY || DIRECT_GEMINI_API_KEY === 'YOUR_ACTUAL_GEMINI_API_KEY') {
    console.warn('No valid direct Gemini API key provided for fallback');
    return null;
  }
  
  try {
    console.log('Attempting direct Gemini API call with client-side key');
    
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': DIRECT_GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
        }
      }),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Direct Gemini API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error('Invalid Gemini API response structure');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Direct Gemini API call failed:', error);
    return null;
  }
}
