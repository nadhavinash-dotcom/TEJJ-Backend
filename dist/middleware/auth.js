"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.adminAuthMiddleware = adminAuthMiddleware;
const firebase_admin_1 = require("../config/firebase-admin");
const User_1 = require("../models/User");
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'No token provided' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = await firebase_admin_1.admin.auth().verifyIdToken(token);
        const user = await User_1.User.findOne({ firebase_uid: decoded.uid });
        if (!user) {
            res.status(401).json({ success: false, error: 'User not found' });
            return;
        }
        req.user = { uid: decoded.uid, userId: user._id.toString(), phone: user.phone_number };
        // Update last_active and fcm_token if provided
        const fcmToken = req.headers['x-fcm-token'];
        const updates = { last_active: new Date() };
        if (fcmToken)
            updates.fcm_token = fcmToken;
        await User_1.User.updateOne({ _id: user._id }, updates);
        next();
    }
    catch {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
}
async function adminAuthMiddleware(req, res, next) {
    const secret = req.headers['x-admin-secret'];
    if (secret !== process.env.ADMIN_SECRET) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }
    next();
}
//# sourceMappingURL=auth.js.map