import { Router, Request, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { transcribeAndTranslate } from '../services/voiceService';
import { mapVoiceToSkill, mapVoiceToExperience, mapVoiceToPay } from '../utils';

const router = Router();

// POST /voice/transcribe-translate
router.post('/transcribe-translate', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { text, sourceLanguage = 'hi' } = req.body;

  if (!text?.trim()) {
    res.status(400).json({ success: false, error: 'Text is required' });
    return;
  }

  const result = await transcribeAndTranslate(text, sourceLanguage);

  // Enhance with structured field mappings
  const structured: Record<string, unknown> = {};
  const skill = mapVoiceToSkill(result.englishText);
  if (skill) structured.primary_skill = skill;
  const exp = mapVoiceToExperience(result.englishText);
  if (exp !== null) structured.years_experience = exp;
  const pay = mapVoiceToPay(result.englishText);
  if (pay !== null) structured.min_pay_per_shift = pay;

  res.json({ success: true, data: { ...result, structured } });
});

export default router;
