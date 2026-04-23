import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { WhisperPost } from '../models/WhisperPost';
import { Worker } from '../models/Worker';
import crypto from 'crypto';

const router = Router();

// GET /whisper — Get approved whisper posts
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { city, category, page = 1, limit = 20 } = req.query;
  const query: Record<string, unknown> = { status: 'APPROVED' };
  if (city) query.employer_locality = { $regex: city as string, $options: 'i' };
  if (category) query.category = category;

  const posts = await WhisperPost.find(query)
    .sort({ created_at: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data: posts });
});

// POST /whisper — Create whisper post (anonymous)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const { employer_locality, employer_type, category, content, complaint_text, original_language, transcribed_english } = req.body;
  const normalizedContent = typeof content === 'string' && content.trim()
    ? content.trim()
    : typeof complaint_text === 'string' && complaint_text.trim()
      ? complaint_text.trim()
      : '';

  if (!category || !normalizedContent) {
    res.status(400).json({ success: false, error: 'category and content are required' });
    return;
  }

  const worker_id_hash = crypto.createHash('sha256').update(worker._id.toString()).digest('hex');

  const post = await WhisperPost.create({
    worker_id_hash,
    employer_locality,
    employer_type,
    category,
    content: normalizedContent,
    original_language,
    transcribed_english,
    status: 'PENDING_REVIEW',
  });

  res.status(201).json({ success: true, data: { post_id: post._id } });
});

// POST /whisper/:id/helpful — Mark post as helpful
router.post('/:id/helpful', authMiddleware, async (req: AuthRequest, res: Response) => {
  await WhisperPost.updateOne({ _id: req.params.id, status: 'APPROVED' }, { $inc: { helpful_count: 1 } });
  res.json({ success: true });
});

export default router;
