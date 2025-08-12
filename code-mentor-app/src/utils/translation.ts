import { GEMINI_API_KEY, GEMINI_MODEL } from '../config/api';

// Cache for translations to avoid redundant API calls
const translationCache: Record<string, Record<string, string>> = {};

/**
 * Translates text to the specified language using Gemini API
 * @param text The text to translate
 * @param targetLanguage The language code to translate to (e.g., 'hi' for Hindi)
 * @returns The translated text
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // If target language is English, return the original text
  if (targetLanguage === 'en') {
    return text;
  }
  
  // Check cache first
  if (translationCache[targetLanguage]?.[text]) {
    console.log('Using cached translation');
    return translationCache[targetLanguage][text];
  }
  
  try {
    console.log(`Translating text to ${targetLanguage}...`);
    
    // Get language name for better prompting
    const languageNames: Record<string, string> = {
      'hi': 'Hindi',
      'es': 'Spanish',
      'fr': 'French',
      'de': 'German',
      'ja': 'Japanese',
      'ko': 'Korean',
      'zh': 'Chinese',
      'ar': 'Arabic',
      'ru': 'Russian',
    };
    
    const languageName = languageNames[targetLanguage] || targetLanguage;
    
    // Use Gemini API for translation
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Translate the following text to ${languageName}. Provide only the translated text without any explanations or additional content:\n\n${text}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.candidates[0].content.parts[0].text.trim();
    
    // Cache the translation
    if (!translationCache[targetLanguage]) {
      translationCache[targetLanguage] = {};
    }
    translationCache[targetLanguage][text] = translatedText;
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fall back to original text on error
  }
}
