"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribeAndTranslate = transcribeAndTranslate;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("@tejj/utils");
const GOOGLE_TRANSLATE_API = 'https://translation.googleapis.com/language/translate/v2';
async function transcribeAndTranslate(text, sourceLanguage) {
    if (!text?.trim()) {
        return { originalText: '', englishText: '', keywords: [] };
    }
    if (sourceLanguage === 'en') {
        return {
            originalText: text,
            englishText: text,
            keywords: (0, utils_1.extractKeywords)(text),
        };
    }
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
        // No API key — return text as-is with best-effort keyword extraction
        return {
            originalText: text,
            englishText: text,
            keywords: (0, utils_1.extractKeywords)(text),
        };
    }
    try {
        const response = await axios_1.default.post(`${GOOGLE_TRANSLATE_API}?key=${apiKey}`, {
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
            keywords: (0, utils_1.extractKeywords)(englishText),
            detectedLanguage,
        };
    }
    catch (err) {
        console.error('Translation error:', err);
        return {
            originalText: text,
            englishText: text,
            keywords: (0, utils_1.extractKeywords)(text),
        };
    }
}
//# sourceMappingURL=voiceService.js.map