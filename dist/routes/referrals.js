"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Referral_1 = require("../models/Referral");
const Worker_1 = require("../models/Worker");
const User_1 = require("../models/User");
const router = (0, express_1.Router)();
// GET /referrals/mine — get my referral stats
router.get('/mine', auth_1.authMiddleware, async (req, res) => {
    try {
        const uid = req.uid;
        const user = await User_1.User.findOne({ firebase_uid: uid });
        if (!user)
            return res.status(404).json({ success: false, message: 'User not found' });
        const worker = await Worker_1.Worker.findOne({ user_id: user._id });
        if (!worker)
            return res.status(404).json({ success: false, message: 'Worker not found' });
        const referralCode = `TEJJ${String(worker._id).slice(-6).toUpperCase()}`;
        const referrals = await Referral_1.Referral.find({ referrer_worker_id: worker._id });
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
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
// POST /referrals/use — worker uses a referral code
router.post('/use', auth_1.authMiddleware, async (req, res) => {
    try {
        const uid = req.uid;
        const { referral_code } = req.body;
        const user = await User_1.User.findOne({ firebase_uid: uid });
        if (!user)
            return res.status(404).json({ success: false });
        const worker = await Worker_1.Worker.findOne({ user_id: user._id });
        if (!worker)
            return res.status(404).json({ success: false });
        // Find referrer from code (last 6 chars of ObjectId)
        const suffix = referral_code?.replace('TEJJ', '').toLowerCase();
        const allWorkers = await Worker_1.Worker.find();
        const referrer = allWorkers.find((w) => String(w._id).slice(-6).toLowerCase() === suffix);
        if (!referrer || String(referrer._id) === String(worker._id)) {
            return res.status(400).json({ success: false, message: 'Invalid referral code' });
        }
        const existing = await Referral_1.Referral.findOne({ referred_worker_id: worker._id });
        if (existing)
            return res.status(400).json({ success: false, message: 'Already used a referral code' });
        await Referral_1.Referral.create({
            referrer_worker_id: referrer._id,
            referred_worker_id: worker._id,
            referral_code,
            status: 'PENDING',
        });
        res.json({ success: true, data: { message: 'Referral applied!' } });
    }
    catch (err) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
exports.default = router;
//# sourceMappingURL=referrals.js.map