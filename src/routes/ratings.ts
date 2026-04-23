import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { RatingWorker } from '../models/RatingWorker';
import { RatingEmployer } from '../models/RatingEmployer';
import { Match } from '../models/Match';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { recomputeWorkerTrustScore, recomputeEmployerDignityScore } from '../services/trustScoreService';
import crypto from 'crypto';

const router = Router();

// POST /ratings/worker — Employer rates worker
router.post('/worker', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const { match_id, overall_score, skill_match, punctuality, professionalism, would_rehire, on_time, private_note } = req.body;

  const match = await Match.findOne({ _id: match_id, employer_id: employer._id, status: { $in: ['CONFIRMED', 'COMPLETED'] } });
  if (!match) {
    res.status(404).json({ success: false, error: 'Match not found or not confirmable' });
    return;
  }

  const rating = await RatingWorker.create({
    match_id,
    worker_id: match.worker_id,
    employer_id: employer._id,
    overall_score,
    skill_match,
    punctuality,
    professionalism,
    would_rehire,
    on_time,
    private_note,
  });

  await Match.updateOne({ _id: match_id }, { $set: { worker_rating_id: rating._id, status: 'COMPLETED' } });

  // Async recompute
  recomputeWorkerTrustScore(match.worker_id.toString()).catch(console.error);

  res.status(201).json({ success: true, data: { rating_id: rating._id } });
});

// POST /ratings/employer — Worker rates employer
router.post('/employer', authMiddleware, async (req: AuthRequest, res: Response) => {
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const { match_id, overall_score, pay_on_time, respectful_treatment, would_return, private_note } = req.body;

  const match = await Match.findOne({ _id: match_id, worker_id: worker._id, status: { $in: ['CONFIRMED', 'COMPLETED'] } });
  if (!match) {
    res.status(404).json({ success: false, error: 'Match not found' });
    return;
  }

  const worker_id_hash = crypto.createHash('sha256').update(worker._id.toString()).digest('hex');

  const rating = await RatingEmployer.create({
    match_id,
    worker_id_hash,
    employer_id: match.employer_id,
    overall_score,
    pay_on_time,
    respectful_treatment,
    would_return,
    private_note,
  });

  await Match.updateOne({ _id: match_id }, { $set: { employer_rating_id: rating._id } });

  // Async recompute
  recomputeEmployerDignityScore(match.employer_id.toString()).catch(console.error);

  res.status(201).json({ success: true, data: { rating_id: rating._id } });
});

// GET /ratings/employer/:id — Get employer ratings (public aggregate)
router.get('/employer/:id', async (req, res: Response) => {
  const ratings = await RatingEmployer.find({ employer_id: req.params.id }).lean();
  if (!ratings.length) {
    res.json({ success: true, data: { count: 0, avg: 0, samples: [] } });
    return;
  }

  const avg = ratings.reduce((s, r) => s + r.overall_score, 0) / ratings.length;
  const samples = ratings.slice(-3).map(r => ({
    score: r.overall_score,
    pay_on_time: r.pay_on_time,
    would_return: r.would_return,
  }));

  res.json({ success: true, data: { count: ratings.length, avg: Math.round(avg * 10) / 10, samples } });
});

export default router;
