import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middleware/auth';
import { Referral } from '../models/Referral';
import { Worker } from '../models/Worker';
import { User } from '../models/User';
import crypto from 'crypto';

const router = Router();

// GET /referrals/mine — get my referral stats
router.get('/mine', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const user = await User.findOne({ firebase_uid: uid });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const worker = await Worker.findOne({ user_id: user._id });
    if (!worker) return res.status(404).json({ success: false, message: 'Worker not found' });

    const referralCode = `TEJJ${String(worker._id).slice(-6).toUpperCase()}`;

    const referrals = await Referral.find({ referrer_worker_id: worker._id });
    const completed = referrals.filter((r) => r.status === 'COMPLETED').length;
    const earnings = completed * 200; // ₹200 per completed referral

    res.json({
      success: true,
      data: {
        referral_code: referralCode,
        total_referred: referrals.length,
        completed,
        earnings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /referrals/use — worker uses a referral code
router.post('/use', authMiddleware, async (req: Request, res: Response) => {
  try {
    const uid = (req as any).uid;
    const { referral_code } = req.body;

    const user = await User.findOne({ firebase_uid: uid });
    if (!user) return res.status(404).json({ success: false });

    const worker = await Worker.findOne({ user_id: user._id });
    if (!worker) return res.status(404).json({ success: false });

    // Find referrer from code (last 6 chars of ObjectId)
    const suffix = referral_code?.replace('TEJJ', '').toLowerCase();
    const allWorkers = await Worker.find();
    const referrer = allWorkers.find((w) => String(w._id).slice(-6).toLowerCase() === suffix);

    if (!referrer || String(referrer._id) === String(worker._id)) {
      return res.status(400).json({ success: false, message: 'Invalid referral code' });
    }

    const existing = await Referral.findOne({ referred_worker_id: worker._id });
    if (existing) return res.status(400).json({ success: false, message: 'Already used a referral code' });

    await Referral.create({
      referrer_worker_id: referrer._id,
      referred_worker_id: worker._id,
      referral_code,
      status: 'PENDING',
    });

    res.json({ success: true, data: { message: 'Referral applied!' } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
