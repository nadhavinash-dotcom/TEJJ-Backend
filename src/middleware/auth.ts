import { Request, Response, NextFunction } from 'express';
import { admin } from '../config/firebase-admin';
import { User } from '../models/User';

export interface FirebaseAuthRequest extends Request {
  firebase?: {
    uid: string;
    phone?: string;
  };
  uid?: string;
}

export interface AuthRequest extends FirebaseAuthRequest {
  user?: {
    uid: string;
    userId: string;
    phone: string;
  };
}

async function verifyFirebaseToken(req: Request, res: Response) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : undefined;
  const bodyToken = typeof req.body?.firebase_token === 'string' ? req.body.firebase_token : undefined;
  const token = bearerToken || bodyToken;

  if (!token) {
    res.status(401).json({ success: false, error: 'No token provided' });
    return null;
  }

  try {
    return await admin.auth().verifyIdToken(token);
  } catch {
    res.status(401).json({ success: false, error: 'Invalid token' });
    return null;
  }
}

export async function firebaseAuthMiddleware(req: FirebaseAuthRequest, res: Response, next: NextFunction): Promise<void> {
  const decoded = await verifyFirebaseToken(req, res);
  if (!decoded) {
    return;
  }

  req.firebase = { uid: decoded.uid, phone: decoded.phone_number };
  req.uid = decoded.uid;
  next();
}

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const decoded = await verifyFirebaseToken(req, res);
  if (!decoded) {
    return;
  }

  try {
    const user = await User.findOne({ firebase_uid: decoded.uid });
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.firebase = { uid: decoded.uid, phone: decoded.phone_number };
    req.uid = decoded.uid;
    req.user = { uid: decoded.uid, userId: user._id.toString(), phone: user.phone_number };

    // Update last_active and fcm_token if provided
    const fcmToken = req.headers['x-fcm-token'] as string;
    const updates: Record<string, unknown> = { last_active: new Date() };
    if (fcmToken) updates.fcm_token = fcmToken;
    await User.updateOne({ _id: user._id }, updates);

    next();
  } catch {
    res.status(500).json({ success: false, error: 'Failed to authenticate user' });
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
