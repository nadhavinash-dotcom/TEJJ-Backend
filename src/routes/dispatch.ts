import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Worker } from '../models/Worker';
import { dispatchAccept } from '../services/dispatchService';
import { Match } from '../models/Match';
import { Employer } from '../models/Employer';
import crypto from 'crypto';

const router = Router();

// POST /dispatch/accept — Worker accepts L1 Flash job (atomic)
router.post('/accept', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { job_id } = req.body;
  const worker = await Worker.findOne({ user_id: req.user!.userId });

  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }
  if (worker.trust_score < 3.0 && worker.total_confirmed_arrivals > 5) {
    res.status(403).json({ success: false, error: 'Trust score too low for L1 jobs' });
    return;
  }

  const result = await dispatchAccept(job_id, worker._id.toString());
  res.json(result);
});

// POST /dispatch/confirm-arrival — Employer scans QR to confirm arrival
router.post('/confirm-arrival', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { qr_token } = req.body;
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  try {
    const payload = JSON.parse(Buffer.from(qr_token, 'base64').toString('utf-8'));
    const { worker_id, match_id, timestamp, signature } = payload;

    const secret = process.env.JWT_SECRET || 'default-secret';
    const expected = crypto.createHmac('sha256', secret)
      .update(`${worker_id}:${match_id}:${timestamp}`)
      .digest('hex');

    if (signature !== expected) {
      res.status(401).json({ success: false, error: 'Invalid QR signature' });
      return;
    }

    if (Date.now() - timestamp > 10 * 60 * 1000) {
      res.status(401).json({ success: false, error: 'QR expired' });
      return;
    }

    const match = await Match.findOneAndUpdate(
      { _id: match_id, employer_id: employer._id, status: { $in: ['MATCHED', 'WORKER_EN_ROUTE', 'ARRIVED'] } },
      { $set: { status: 'CONFIRMED', confirmed_at: new Date(), confirmed_method: 'QR_SCAN' } },
      { new: true }
    );

    if (!match) {
      res.status(404).json({ success: false, error: 'Match not found or already confirmed' });
      return;
    }

    await Employer.updateOne({ _id: employer._id }, {
      $set: { confirm_gate_blocked: false },
      $inc: { total_confirmed_arrivals: 1 },
    });

    await Worker.updateOne({ _id: worker_id }, {
      $inc: { total_confirmed_arrivals: 1 },
      $set: { last_seen: new Date() },
    });

    res.json({ success: true, data: { match_id, confirmed_at: match.confirmed_at } });
  } catch {
    res.status(400).json({ success: false, error: 'Invalid QR token' });
  }
});

// POST /dispatch/no-show — Employer reports worker no-show
router.post('/no-show', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { match_id } = req.body;
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const match = await Match.findOneAndUpdate(
    { _id: match_id, employer_id: employer._id, status: { $in: ['MATCHED', 'WORKER_EN_ROUTE'] } },
    {
      $set: {
        status: 'NO_SHOW_WORKER',
        no_show_reported_at: new Date(),
        no_show_reported_by: 'EMPLOYER',
      }
    },
    { new: true }
  );

  if (!match) {
    res.status(404).json({ success: false, error: 'Match not found' });
    return;
  }

  await Employer.updateOne({ _id: employer._id }, { $set: { confirm_gate_blocked: false } });
  await Worker.updateOne({ _id: match.worker_id }, { $inc: { total_no_shows: 1 } });

  // Recompute trust score asynchronously
  const { recomputeWorkerTrustScore } = await import('../services/trustScoreService');
  recomputeWorkerTrustScore(match.worker_id.toString()).catch(console.error);

  res.json({ success: true });
});

// POST /dispatch/generate-qr — Generate QR token for worker
router.post('/generate-qr', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { match_id } = req.body;
  const worker = await Worker.findOne({ user_id: req.user!.userId });
  if (!worker) {
    res.status(403).json({ success: false, error: 'No worker profile' });
    return;
  }

  const match = await Match.findOne({ _id: match_id, worker_id: worker._id });
  if (!match) {
    res.status(404).json({ success: false, error: 'Match not found' });
    return;
  }

  const timestamp = Date.now();
  const secret = process.env.JWT_SECRET || 'default-secret';
  const signature = crypto.createHmac('sha256', secret)
    .update(`${worker._id}:${match_id}:${timestamp}`)
    .digest('hex');

  const payload = Buffer.from(JSON.stringify({
    worker_id: worker._id.toString(),
    match_id,
    timestamp,
    signature,
  })).toString('base64');

  res.json({ success: true, data: { qr_token: payload, expires_in: 300 } });
});

export default router;
