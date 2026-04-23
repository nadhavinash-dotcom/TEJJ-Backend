"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const WhisperPost_1 = require("../models/WhisperPost");
const Worker_1 = require("../models/Worker");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
// GET /whisper — Get approved whisper posts
router.get('/', auth_1.authMiddleware, async (req, res) => {
    const { city, category, page = 1, limit = 20 } = req.query;
    const query = { status: 'APPROVED' };
    if (city)
        query.employer_locality = { $regex: city, $options: 'i' };
    if (category)
        query.category = category;
    const posts = await WhisperPost_1.WhisperPost.find(query)
        .sort({ created_at: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    res.json({ success: true, data: posts });
});
// POST /whisper — Create whisper post (anonymous)
router.post('/', auth_1.authMiddleware, async (req, res) => {
    const worker = await Worker_1.Worker.findOne({ user_id: req.user.userId });
    if (!worker) {
        res.status(403).json({ success: false, error: 'No worker profile' });
        return;
    }
    const { employer_locality, employer_type, category, content, original_language, transcribed_english } = req.body;
    const worker_id_hash = crypto_1.default.createHash('sha256').update(worker._id.toString()).digest('hex');
    const post = await WhisperPost_1.WhisperPost.create({
        worker_id_hash,
        employer_locality,
        employer_type,
        category,
        content,
        original_language,
        transcribed_english,
        status: 'PENDING_REVIEW',
    });
    res.status(201).json({ success: true, data: { post_id: post._id } });
});
// POST /whisper/:id/helpful — Mark post as helpful
router.post('/:id/helpful', auth_1.authMiddleware, async (req, res) => {
    await WhisperPost_1.WhisperPost.updateOne({ _id: req.params.id, status: 'APPROVED' }, { $inc: { helpful_count: 1 } });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=whisper.js.map