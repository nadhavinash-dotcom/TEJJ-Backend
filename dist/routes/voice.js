"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const voiceService_1 = require("../services/voiceService");
const utils_1 = require("@tejj/utils");
const router = (0, express_1.Router)();
// POST /voice/transcribe-translate
router.post('/transcribe-translate', auth_1.authMiddleware, async (req, res) => {
    const { text, sourceLanguage = 'hi' } = req.body;
    if (!text?.trim()) {
        res.status(400).json({ success: false, error: 'Text is required' });
        return;
    }
    const result = await (0, voiceService_1.transcribeAndTranslate)(text, sourceLanguage);
    // Enhance with structured field mappings
    const structured = {};
    const skill = (0, utils_1.mapVoiceToSkill)(result.englishText);
    if (skill)
        structured.primary_skill = skill;
    const exp = (0, utils_1.mapVoiceToExperience)(result.englishText);
    if (exp !== null)
        structured.years_experience = exp;
    const pay = (0, utils_1.mapVoiceToPay)(result.englishText);
    if (pay !== null)
        structured.min_pay_per_shift = pay;
    res.json({ success: true, data: { ...result, structured } });
});
exports.default = router;
//# sourceMappingURL=voice.js.map