import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = Router();

// GET /notifications — User's notification inbox
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { page = 1, limit = 30 } = req.query;
  const notifications = await Notification.find({ user_id: req.user!.userId })
    .sort({ created_at: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit))
    .lean();

  res.json({ success: true, data: notifications });
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authMiddleware, async (req: AuthRequest, res: Response) => {
  await Notification.updateOne(
    { _id: req.params.id, user_id: req.user!.userId },
    { $set: { read: true, read_at: new Date() } }
  );
  res.json({ success: true });
});

// PATCH /notifications/read-all
router.patch('/read-all', authMiddleware, async (req: AuthRequest, res: Response) => {
  await Notification.updateMany(
    { user_id: req.user!.userId, read: false },
    { $set: { read: true, read_at: new Date() } }
  );
  res.json({ success: true });
});

export default router;
