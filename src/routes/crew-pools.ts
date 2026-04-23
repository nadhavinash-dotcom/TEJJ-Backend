import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Employer } from '../models/Employer';
import { CrewPool } from '../models/CrewPool';
import { CrewPoolMember } from '../models/CrewPoolMember';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  const pools = await CrewPool.find({ employer_id: employer._id }).sort({ created_at: -1 }).lean();
  const counts = await CrewPoolMember.aggregate([
    { $match: { pool_id: { $in: pools.map((pool) => pool._id) }, is_active: true } },
    { $group: { _id: '$pool_id', member_count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((entry) => [String(entry._id), entry.member_count]));

  res.json({
    success: true,
    data: pools.map((pool) => ({
      _id: pool._id,
      name: pool.pool_name,
      description: pool.description ?? '',
      member_count: countMap.get(String(pool._id)) ?? 0,
    })),
  });
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const employer = await Employer.findOne({ user_id: req.user!.userId });
  if (!employer) {
    res.status(403).json({ success: false, error: 'Not an employer' });
    return;
  }

  if (typeof req.body.name !== 'string' || !req.body.name.trim()) {
    res.status(400).json({ success: false, error: 'name is required' });
    return;
  }

  const pool = await CrewPool.create({
    employer_id: employer._id,
    pool_name: req.body.name.trim(),
    description: typeof req.body.description === 'string' ? req.body.description.trim() : undefined,
  });

  res.status(201).json({
    success: true,
    data: {
      _id: pool._id,
      name: pool.pool_name,
      description: pool.description ?? '',
      member_count: 0,
    },
  });
});

export default router;
