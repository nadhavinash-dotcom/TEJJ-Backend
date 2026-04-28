import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Worker } from '../models/Worker';
import { Employer } from '../models/Employer';
import { buildProfileRoutingState } from '../utils/contract-helpers';
import { otpService } from '../services/twilioProvider';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

// POST /auth/otp/send — Trigger OTP via OTP Service
router.post('/otp/send', async (req: Request, res: Response) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    res.status(400).json({ success: false, error: 'Phone number is required' });
    return;
  }

  // const cleanPhone = phone_number.replace(/^\+/, '').replace(/\s+/g, '');

  console.log(`Sending OTP to ${phone_number}`);

  const success = await otpService.send(phone_number);
  if (success) {
    res.json({ success: true, message: 'OTP sent successfully' });
  } else {
    res.status(500).json({ success: false, error: 'Failed to send OTP' });
  }
});

// POST /auth/otp/verify — Verify OTP and return JWT
router.post('/otp/verify', async (req: Request, res: Response) => {
  const { phone_number, code, language, fcm_token } = req.body;

  if (!phone_number || !code) {
    res.status(400).json({ success: false, error: 'Phone number and code are required' });
    return;
  }

  const isValid = await otpService.verify(phone_number, code);
  if (!isValid) {
    res.status(401).json({ success: false, error: 'Invalid or expired OTP' });
    return;
  }

  try {
    console.log({ phone_number, code, language, fcm_token })
    let user = await User.findOne({ phone_number });

    console.log({ user })

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        phone_number,
        firebase_uid: `custom_${Date.now()}`, // Placeholder since original schema requires it
        language: language || 'hi',
        fcm_token,
        has_worker: false,
        has_employer: false,
      });
    } else {
      // Update existing user
      await User.updateOne({ _id: user._id }, {
        $set: { fcm_token, language: language || user.language, last_active: new Date() }
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, phone: user.phone_number, role: user.active_role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user_id: user._id,
        is_new: !user.created_at || (Date.now() - user.created_at.getTime() < 5000)
      }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
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
