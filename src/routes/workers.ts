import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Worker } from '../models/Worker';
import { User } from '../models/User';
import { buildProfileRoutingState, computeProfileDepthScore, ContractValidationError, mockAIScore, normalizeWorkerOnboardingPayload } from '../utils';
import crypto from 'crypto';

const router = Router();

// GET /workers/me
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId }).lean();
  if (!worker) {
    res.status(404).json({ success: false, error: 'Worker profile not found' });
    return;
  }
  res.json({
    success: true,
    data: {
      ...worker,
      sub_skills: worker.secondary_skills ?? [],
      home_lat: worker.home_location?.coordinates?.[1] ?? null,
      home_lng: worker.home_location?.coordinates?.[0] ?? null,
      home_city: worker.city ?? null,
      home_area: worker.area_locality ?? null,
      agent_mode_enabled: worker.agent_enabled ?? false,
      ai_score: worker.ai_score_technique || worker.ai_score_speed || worker.ai_score_hygiene || worker.ai_score_warmth
        ? {
            technique: worker.ai_score_technique ?? 0,
            speed: worker.ai_score_speed ?? 0,
            hygiene: worker.ai_score_hygiene ?? 0,
            warmth: worker.ai_score_warmth ?? 0,
          }
        : null,
    },
  });
});

// GET /workers/profile-status
router.get('/profile-status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId }).select('_id').lean();
  res.json({
    success: true,
    data: {
      worker_id: worker?._id ?? null,
      ...buildProfileRoutingState({ role: 'worker', hasProfile: Boolean(worker) }),
    },
  });
});

// POST /workers — Create worker profile
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const existing = await Worker.findOne({ user_id: req.user!.userId });
  if (existing) {
    res.status(409).json({ success: false, error: 'Worker profile already exists' });
    return;
  }

  try {
    const payload = normalizeWorkerOnboardingPayload(req.body);
    const worker = await Worker.create({
      user_id: req.user!.userId,
      status: 'DRAFT',
      ...payload,
    });

    await User.updateOne({ _id: req.user!.userId }, { $set: { has_worker: true, active_role: 'worker', fcm_token: payload.fcm_token } });

    res.status(201).json({
      success: true,
      data: {
        _id: req.user!.userId,
        worker_id: worker._id,
        has_worker: true,
        active_role: 'worker',
      },
    });
  } catch (error) {
    if (error instanceof ContractValidationError) {
      res.status(400).json({ success: false, error: error.message, details: error.details });
      return;
    }
    console.error('Create Worker Error:', error);
    res.status(500).json({ success: false, error: 'Failed to create worker profile' });
  }
});

// PATCH /workers/me — Update worker profile
router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const {
    primary_skill, sub_skills, years_experience, min_pay_per_shift,
    home_lat, home_lng, home_city, home_area, available_days, preferred_shifts,
    profile_photo_url, skill_video_url
  } = req.body;

  const updates: any = {};

  // Work Details
  if (primary_skill !== undefined) updates.primary_skill = String(primary_skill);
  if (Array.isArray(sub_skills)) updates.secondary_skills = sub_skills.map(String);
  if (years_experience !== undefined) {
    const parsed = Number(years_experience);
    if (isNaN(parsed)) return res.status(400).json({ success: false, error: 'years_experience must be a number' });
    updates.years_experience = parsed;
  }
  if (min_pay_per_shift !== undefined) {
    const parsed = Number(min_pay_per_shift);
    if (isNaN(parsed)) return res.status(400).json({ success: false, error: 'min_pay_per_shift must be a number' });
    updates.min_pay_per_shift = parsed;
  }

  // Schedule & Location
  if (home_city !== undefined) updates.city = String(home_city);
  if (home_area !== undefined) updates.area_locality = String(home_area);
  if (available_days !== undefined) {
    if (!Array.isArray(available_days)) return res.status(400).json({ success: false, error: 'available_days must be an array' });
    updates.available_days = available_days.map(String);
  }
  if (preferred_shifts !== undefined) {
    if (!Array.isArray(preferred_shifts)) return res.status(400).json({ success: false, error: 'preferred_shifts must be an array' });
    updates.preferred_shifts = preferred_shifts.map(String);
  }

  if (home_lat !== undefined && home_lng !== undefined) {
    const lat = Number(home_lat);
    const lng = Number(home_lng);
    if (isNaN(lat) || isNaN(lng)) return res.status(400).json({ success: false, error: 'home_lat and home_lng must be numbers' });
    updates.home_location = {
      type: 'Point',
      coordinates: [lng, lat] // GeoJSON: [longitude, latitude]
    };
  } else if (home_lat !== undefined || home_lng !== undefined) {
    return res.status(400).json({ success: false, error: 'Both home_lat and home_lng must be provided together' });
  }

  // Media
  if (profile_photo_url !== undefined) updates.profile_photo_url = String(profile_photo_url);
  if (skill_video_url !== undefined) updates.skill_video_url = String(skill_video_url);

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ success: false, error: 'No valid fields provided for update' });
    return;
  }

  try {
    const worker = await Worker.findOneAndUpdate(
      { user_id: req.user!.userId },
      { $set: updates },
      { new: true }
    );

    if (!worker) {
      res.status(404).json({ success: false, error: 'Worker profile not found' });
      return;
    }

    res.json({ success: true, data: worker });
  } catch (error) {
    console.error('Update Worker Error:', error);
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// PATCH /workers/agent-mode
router.patch('/agent-mode', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { agent_mode_enabled, agent_rules } = req.body;

  if (typeof agent_mode_enabled !== 'boolean') {
    res.status(400).json({ success: false, error: 'agent_mode_enabled must be a boolean' });
    return;
  }

  const updates: Record<string, unknown> = { agent_enabled: agent_mode_enabled };
  if (agent_rules !== undefined) {
    if (typeof agent_rules !== 'object' || agent_rules === null || Array.isArray(agent_rules)) {
      res.status(400).json({ success: false, error: 'agent_rules must be an object' });
      return;
    }
    updates.agent_rules = agent_rules;
  }

  const worker = await Worker.findOneAndUpdate(
    { user_id: req.user!.userId },
    { $set: updates },
    { new: true }
  ).lean();

  if (!worker) {
    res.status(404).json({ success: false, error: 'Worker profile not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      agent_mode_enabled: worker.agent_enabled,
      agent_rules: worker.agent_rules ?? {},
    },
  });
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

// GET /workers/:id/card — Employer-facing worker skill card
router.get('/:id/card', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findById(req.params.id)
    .select('profile_photo_url primary_skill secondary_skills years_experience trust_score preferred_shifts ai_score ai_score_technique ai_score_speed ai_score_hygiene ai_score_warmth')
    .lean();

  if (!worker) {
    res.status(404).json({ success: false, error: 'Worker not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      _id: worker._id,
      profile_photo_url: worker.profile_photo_url ?? null,
      primary_skill: worker.primary_skill ?? null,
      sub_skills: worker.secondary_skills ?? [],
      years_experience: worker.years_experience ?? 0,
      trust_score: worker.trust_score ?? 0,
      preferred_shifts: worker.preferred_shifts ?? [],
      ai_score: worker.ai_score_technique || worker.ai_score_speed || worker.ai_score_hygiene || worker.ai_score_warmth
        ? {
            technique: worker.ai_score_technique ?? 0,
            speed: worker.ai_score_speed ?? 0,
            hygiene: worker.ai_score_hygiene ?? 0,
            warmth: worker.ai_score_warmth ?? 0,
          }
        : null,
    },
  });
});

export default router;
