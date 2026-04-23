import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Worker } from '../models/Worker';
import { User } from '../models/User';
import { computeProfileDepthScore, mockAIScore } from '../../utils';
import crypto from 'crypto';

const router = Router();

// GET /workers/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId }).lean();
  if (!worker) {
    res.status(404).json({ success: false, error: 'Worker profile not found' });
    return;
  }
  res.json({ success: true, data: worker });
});

// POST /workers — Create worker profile
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await Worker.findOne({ user_id: req.user!.userId });
  if (existing) {
    res.status(409).json({ success: false, error: 'Worker profile already exists' });
    return;
  }

  const worker = await Worker.create({
    user_id: req.user!.userId,
    status: 'DRAFT',
    ...req.body,
  });

  await User.updateOne({ _id: req.user!.userId }, { $set: { has_worker: true, active_role: 'worker' } });

  res.status(201).json({ success: true, data: { worker_id: worker._id } });
});

// PATCH /workers/me — Update worker profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const updates = req.body;

  // Prevent direct trust_score manipulation
  delete updates.trust_score;
  delete updates.show_up_rate;
  delete updates.employer_rating_avg;

  const worker = await Worker.findOneAndUpdate(
    { user_id: req.user!.userId },
    { $set: updates },
    { new: true }
  );

  if (!worker) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  res.json({ success: true, data: worker });
});

// POST /workers/me/go-live — Activate worker profile
router.post('/me/go-live', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(404).json({ success: false, error: 'Not found' });
    return;
  }

  if (!worker.primary_skill || !worker.home_location || worker.available_days.length === 0) {
    res.status(400).json({ success: false, error: 'Incomplete profile — skill, location, and availability required' });
    return;
  }

  const nameBase = (worker.full_name || 'USER').toUpperCase().replace(/\s+/, '').substring(0, 6);
  const referral_code = `${nameBase}${Math.floor(100 + Math.random() * 900)}`;

  const profile_depth_score = computeProfileDepthScore({
    profile_photo_url: worker.profile_photo_url,
    skill_video_url: worker.skill_video_url,
    cuisine_specialities: worker.cuisine_specialities,
    fssai_certified: worker.fssai_certified,
    highest_qualification: worker.highest_qualification,
    english_level: worker.english_level,
    transport_mode: worker.transport_mode,
  });

  const newStatus = worker.skill_video_url ? 'ACTIVE' : 'DRAFT_ACTIVE';

  await Worker.updateOne({ _id: worker._id }, {
    $set: { status: newStatus, referral_code, profile_depth_score }
  });

  res.json({ success: true, data: { status: newStatus, referral_code } });
});

// POST /workers/me/score-video — Trigger mock AI video scoring
router.post('/me/score-video', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker || !worker.skill_video_url) {
    res.status(400).json({ success: false, error: 'No video uploaded' });
    return;
  }

  // Mock scoring — simulate 60s async processing
  setTimeout(async () => {
    const scores = mockAIScore();
    await Worker.updateOne({ _id: worker._id }, {
      $set: {
        ai_score: scores.overall,
        ai_score_technique: scores.technique,
        ai_score_speed: scores.speed,
        ai_score_hygiene: scores.hygiene,
        ai_score_warmth: scores.warmth,
        ai_score_status: 'SCORED',
        ai_score_feedback: scores.feedback,
        ai_confidence_score: 70 + Math.random() * 25,
        ai_scored_at: new Date(),
      }
    });
  }, 60000);

  await Worker.updateOne({ _id: worker._id }, { $set: { ai_score_status: 'PENDING' } });

  res.json({ success: true, message: 'Scoring in progress — check back in 60 seconds' });
});

// GET /workers/:id/verify — QR code verification endpoint
router.get('/:id/verify', async (req, res: Response) => {
  const { token } = req.query as { token: string };
  if (!token) {
    res.status(400).json({ success: false, error: 'No token' });
    return;
  }

  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const { worker_id, match_id, timestamp, signature } = payload;

    const secret = process.env.JWT_SECRET || 'default-secret';
    const expected = crypto.createHmac('sha256', secret)
      .update(`${worker_id}:${match_id}:${timestamp}`)
      .digest('hex');

    if (signature !== expected) {
      res.status(401).json({ success: false, error: 'Invalid signature' });
      return;
    }

    const age = Date.now() - timestamp;
    if (age > 10 * 60 * 1000) {
      res.status(401).json({ success: false, error: 'QR expired' });
      return;
    }

    const worker = await Worker.findById(worker_id).select('full_name profile_photo_url primary_skill trust_score').lean();
    res.json({ success: true, data: { worker, match_id } });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid token' });
  }
});

export default router;
