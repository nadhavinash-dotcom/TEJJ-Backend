import { SKILL_LIST, CUISINE_LIST } from './constants';

export function extractKeywords(englishText: string): string[] {
  const lower = englishText.toLowerCase();
  const found = new Set<string>();

  for (const skill of SKILL_LIST) {
    for (const kw of skill.keywords) {
      if (lower.includes(kw)) {
        found.add(skill.id);
        break;
      }
    }
  }

  for (const cuisine of CUISINE_LIST) {
    for (const kw of cuisine.keywords) {
      if (lower.includes(kw)) {
        found.add(cuisine.id);
        break;
      }
    }
  }

  // Extract experience numbers
  const expMatch = lower.match(/(\d+)\s*(year|saal|sal|yr)/);
  if (expMatch) {
    found.add(`experience_${expMatch[1]}_years`);
  }

  // Extract pay amounts
  const payMatch = lower.match(/(\d{3,5})\s*(rupee|rupaye|rs|inr)/);
  if (payMatch) {
    found.add(`pay_${payMatch[1]}`);
  }

  return Array.from(found);
}

export function mapVoiceToSkill(englishText: string): string | null {
  const lower = englishText.toLowerCase();

  for (const skill of SKILL_LIST) {
    for (const kw of skill.keywords) {
      if (lower.includes(kw)) {
        return skill.id;
      }
    }
  }
  return null;
}

export function mapVoiceToExperience(englishText: string): number | null {
  const lower = englishText.toLowerCase();

  // Hindi number words
  const hindiNumbers: Record<string, number> = {
    'ek': 1, 'do': 2, 'teen': 3, 'char': 4, 'paanch': 5,
    'chhe': 6, 'saat': 7, 'aath': 8, 'nau': 9, 'das': 10,
    'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  };

  for (const [word, num] of Object.entries(hindiNumbers)) {
    if (lower.includes(word + ' saal') || lower.includes(word + ' year') || lower.includes(word + ' sal')) {
      return Math.min(num, 6);
    }
  }

  const digitMatch = lower.match(/(\d+)\s*(saal|year|sal|yr)/);
  if (digitMatch) {
    return Math.min(parseInt(digitMatch[1], 10), 6);
  }

  if (lower.includes('fresher') || lower.includes('naya') || lower.includes('beginner')) {
    return 0;
  }

  return null;
}

export function mapVoiceToPay(englishText: string): number | null {
  const lower = englishText.toLowerCase();

  // Hindi number words for common pay amounts
  const hindiAmounts: Record<string, number> = {
    'paanch sau': 500, 'chhe sau': 600, 'saat sau': 700,
    'aath sau': 800, 'nau sau': 900, 'ek hazaar': 1000,
    'do hazaar': 2000, 'teen hazaar': 3000,
  };

  for (const [phrase, amount] of Object.entries(hindiAmounts)) {
    if (lower.includes(phrase)) {
      return amount;
    }
  }

  const digitMatch = lower.match(/(\d{3,5})/);
  if (digitMatch) {
    return parseInt(digitMatch[1], 10);
  }

  return null;
}
