"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const firebase_admin_1 = require("../config/firebase-admin");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// POST /auth/register — Called after Firebase phone OTP success
router.post('/register', async (req, res) => {
    const { firebase_token, language, fcm_token, referral_code } = req.body;
    try {
        const decoded = await firebase_admin_1.admin.auth().verifyIdToken(firebase_token);
        const phone = decoded.phone_number;
        if (!phone) {
            res.status(400).json({ success: false, error: 'No phone in token' });
            return;
        }
        let user = await User_1.User.findOne({ firebase_uid: decoded.uid });
        if (user) {
            // Existing user — update token
            await User_1.User.updateOne({ _id: user._id }, {
                $set: { fcm_token, language, last_active: new Date() }
            });
            res.json({ success: true, data: { user_id: user._id, is_new: false } });
            return;
        }
        user = await User_1.User.create({
            phone_number: phone,
            firebase_uid: decoded.uid,
            language: language || 'hi',
            fcm_token,
            has_worker: false,
            has_employer: false,
        });
        res.status(201).json({ success: true, data: { user_id: user._id, is_new: true } });
    }
    catch (err) {
        console.error(err);
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});
// GET /auth/me — Get current user
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'No token' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = await firebase_admin_1.admin.auth().verifyIdToken(token);
        const user = await User_1.User.findOne({ firebase_uid: decoded.uid }).lean();
        if (!user) {
            res.status(404).json({ success: false, error: 'User not found' });
            return;
        }
        res.json({ success: true, data: user });
    }
    catch {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map