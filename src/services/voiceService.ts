import axios from 'axios';
import { extractKeywords } from '../utils';

const GOOGLE_TRANSLATE_API = 'https://translation.googleapis.com/language/translate/v2';

export async function transcribeAndTranslate(text: string, sourceLanguage: string): Promise<{
  originalText: string;
  englishText: string;
  keywords: string[];
  detectedLanguage?: string;
}> {
  if (!text?.trim()) {
    return { originalText: '', englishText: '', keywords: [] };
  }

  if (sourceLanguage === 'en') {
    return {
      originalText: text,
      englishText: text,
      keywords: extractKeywords(text),
    };
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    // No API key — return text as-is with best-effort keyword extraction
    return {
      originalText: text,
      englishText: text,
      keywords: extractKeywords(text),
    };
  }

  try {
    const response = await axios.post(`${GOOGLE_TRANSLATE_API}?key=${apiKey}`, {
      q: text,
      source: sourceLanguage !== 'auto' ? sourceLanguage : undefined,
      target: 'en',
      format: 'text',
    });

    const translation = response.data?.data?.translations?.[0];
    const englishText = translation?.translatedText ?? text;
    const detectedLanguage = translation?.detectedSourceLanguage;

    return {
      originalText: text,
      englishText,
      keywords: extractKeywords(englishText),
      detectedLanguage,
    };
  } catch (err) {
    console.error('Translation error:', err);
    return {
      originalText: text,
      englishText: text,
      keywords: extractKeywords(text),
    };
  }
}
