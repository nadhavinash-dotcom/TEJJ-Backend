import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    phone: string;
    role?: string;
  };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_fallback_secret';

export async function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  
  // More robust token extraction (handles case-insensitivity and multiple spaces)
  let token: string | undefined;
  if (authHeader) {
    const parts = authHeader.split(/\s+/);
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
      token = parts[1];
    }
  }

  if (!token) {
    console.warn(`[Auth] No token provided for ${req.method} ${req.originalUrl} from ${req.ip}`);
    res.status(401).json({ success: false, error: 'No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; phone: string; role?: string };
    
    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ success: false, error: 'User not found' });
      return;
    }

    req.user = { 
      userId: user._id.toString(), 
      phone: user.phone_number,
      role: user.active_role
    };

    // Update last_active and fcm_token if provided
    const fcmToken = req.headers['x-fcm-token'] as string;
    const updates: Record<string, unknown> = { last_active: new Date() };
    if (fcmToken) updates.fcm_token = fcmToken;
    await User.updateOne({ _id: user._id }, updates);

    next();
  } catch (err) {
    console.error('JWT Verification Error:', err);
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
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
