import { Router, Request, Response } from 'express';
import { adminAuthMiddleware } from '../middleware/auth';
import { User } from '../models/User';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { Job } from '../models/Job';
import { Match } from '../models/Match';
import { WhisperPost } from '../models/WhisperPost';
import { MarketRate } from '../models/MarketRate';
import { SKILL_LIST, INDIAN_CITIES } from '../../utils';

const router = Router();
router.use(adminAuthMiddleware);

// GET /admin/stats — Platform KPIs
router.get('/stats', async (req: Request, res: Response) => {
  const [workers, employers, jobsToday, matchesToday] = await Promise.all([
    Worker.countDocuments({ status: 'ACTIVE' }),
    Employer.countDocuments({ suspended: false }),
    Job.countDocuments({ created_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    Match.countDocuments({ matched_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
  ]);

  res.json({ success: true, data: { active_workers: workers, active_employers: employers, jobs_today: jobsToday, matches_today: matchesToday } });
});

// GET /admin/workers — List workers
router.get('/workers', async (req: Request, res: Response) => {
  const { status, city, page = 1, limit = 50, search } = req.query;
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (city) query.city = city;
  if (search) query.full_name = { $regex: search as string, $options: 'i' };

  const [workers, total] = await Promise.all([
    Worker.find(query).sort({ created_at: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
    Worker.countDocuments(query),
  ]);

  res.json({ success: true, data: workers, total, page: Number(page), limit: Number(limit) });
});

// PATCH /admin/workers/:id — Admin moderation actions
router.patch('/workers/:id', async (req: Request, res: Response) => {
  const { status, suspended, suspension_reason, trust_score } = req.body;
  const updates: Record<string, unknown> = {};
  if (status) updates.status = status;
  if (suspended !== undefined) updates.suspended = suspended;
  if (suspension_reason) updates.suspension_reason = suspension_reason;
  if (trust_score !== undefined) updates.trust_score = trust_score;

  await Worker.updateOne({ _id: req.params.id }, { $set: updates });
  res.json({ success: true });
});

// GET /admin/employers — List employers
router.get('/employers', async (req: Request, res: Response) => {
  const { dignity_state, city, page = 1, limit = 50 } = req.query;
  const query: Record<string, unknown> = {};
  if (dignity_state) query.dignity_state = dignity_state;
  if (city) query.city = city;

  const [employers, total] = await Promise.all([
    Employer.find(query).sort({ created_at: -1 }).skip((Number(page) - 1) * Number(limit)).limit(Number(limit)).lean(),
    Employer.countDocuments(query),
  ]);

  res.json({ success: true, data: employers, total });
});

// GET /admin/whisper — Whisper moderation queue
router.get('/whisper', async (req: Request, res: Response) => {
  const posts = await WhisperPost.find({ status: 'PENDING_REVIEW' }).sort({ created_at: 1 }).limit(50).lean();
  res.json({ success: true, data: posts });
});

// PATCH /admin/whisper/:id — Approve/reject whisper post
router.patch('/whisper/:id', async (req: Request, res: Response) => {
  const { status } = req.body;
  await WhisperPost.updateOne({ _id: req.params.id }, { $set: { status } });
  res.json({ success: true });
});

// PUT /admin/market-rates — Upsert market rate
router.put('/market-rates', async (req: Request, res: Response) => {
  const { city, skill, median, p25, p75 } = req.body;
  await MarketRate.findOneAndUpdate({ city, skill }, { median, p25, p75 }, { upsert: true });
  res.json({ success: true });
});

// POST /admin/seed-market-rates — Seed default market rates
router.post('/seed-market-rates', async (req: Request, res: Response) => {
  const defaults: Array<{ skill: string; median: number; p25: number; p75: number }> = [
    { skill: 'cook', median: 750, p25: 550, p75: 1000 },
    { skill: 'waiter', median: 600, p25: 450, p75: 800 },
    { skill: 'housekeeper', median: 500, p25: 400, p75: 700 },
    { skill: 'barista', median: 650, p25: 500, p75: 900 },
    { skill: 'bartender', median: 800, p25: 600, p75: 1100 },
    { skill: 'security', median: 550, p25: 420, p75: 700 },
    { skill: 'cleaner', median: 400, p25: 300, p75: 550 },
    { skill: 'baker', median: 700, p25: 500, p75: 950 },
  ];

  const ops = [];
  for (const city of INDIAN_CITIES) {
    for (const rate of defaults) {
      ops.push({
        updateOne: {
          filter: { city, skill: rate.skill },
          update: { $setOnInsert: { city, ...rate } },
          upsert: true,
        }
      });
    }
  }

  await MarketRate.bulkWrite(ops);
  res.json({ success: true, message: `Seeded market rates for ${INDIAN_CITIES.length} cities` });
});

export default router;
