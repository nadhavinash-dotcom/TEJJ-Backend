import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware, AuthRequest, firebaseAuthMiddleware, FirebaseAuthRequest } from '../middleware/auth';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { buildProfileRoutingState } from '../utils';

const router = Router();

// POST /auth/register — Called after Firebase phone OTP success
router.post('/register', firebaseAuthMiddleware, async (req: FirebaseAuthRequest, res: Response) => {
  const { language, fcm_token } = req.body;

  try {
    const phone = req.firebase?.phone;
    if (!phone) {
      res.status(400).json({ success: false, error: 'No phone in token' });
      return;
    }

    let user = await User.findOne({ firebase_uid: req.firebase!.uid });

    if (user) {
      // Existing user — update token
      await User.updateOne({ _id: user._id }, {
        $set: { fcm_token, language, last_active: new Date() }
      });
      res.json({ success: true, data: { user_id: user._id, is_new: false } });
      return;
    }

    user = await User.create({
      phone_number: phone,
      firebase_uid: req.firebase!.uid,
      language: language || 'hi',
      fcm_token,
      has_worker: false,
      has_employer: false,
    });

    res.status(201).json({ success: true, data: { user_id: user._id, is_new: true } });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
});

// GET /auth/me — Get current user
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).lean();
    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    const [worker, employer] = await Promise.all([
      Worker.findOne({ user_id: user._id }).select('_id').lean(),
      Employer.findOne({ user_id: user._id }).select('_id').lean(),
    ]);

    res.json({
      success: true,
      data: {
        ...user,
        worker_id: worker?._id ?? null,
        employer_id: employer?._id ?? null,
        worker_profile_routing: buildProfileRoutingState({ role: 'worker', hasProfile: Boolean(worker) }),
        employer_profile_routing: buildProfileRoutingState({ role: 'employer', hasProfile: Boolean(employer) }),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Failed to fetch current user' });
  }
});

// POST /auth/set-role — Set user's active role
router.patch('/set-role', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { role } = req.body;

  if (!['worker', 'employer'].includes(role)) {
    res.status(400).json({ success: false, error: 'Invalid role. Must be worker or employer.' });
    return;
  }

  try {
    const userId = req.user?.userId;
    await User.updateOne({ _id: userId }, { $set: { active_role: role } });
    res.json({ success: true, message: `Active role set to ${role}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to set active role' });
  }
});

export default router;
