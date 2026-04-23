import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase-admin';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    userId: string;
    phone: string;
  };
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const user = await User.findOne({ firebase_uid: decoded.uid });
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = { uid: decoded.uid, userId: user._id.toString(), phone: user.phone_number };

    // Update last_active and fcm_token if provided
    const fcmToken = req.headers['x-fcm-token'] as string;
    const updates: Record<string, unknown> = { last_active: new Date() };
    if (fcmToken) updates.fcm_token = fcmToken;
    await User.updateOne({ _id: user._id }, updates);

    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

export async function adminAuthMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }
  next();
}
