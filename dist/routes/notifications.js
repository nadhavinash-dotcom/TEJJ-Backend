"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const router = (0, express_1.Router)();
// GET /notifications — User's notification inbox
router.get('/', auth_1.authMiddleware, async (req, res) => {
    const { page = 1, limit = 30 } = req.query;
    const notifications = await Notification_1.Notification.find({ user_id: req.user.userId })
        .sort({ created_at: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit))
        .lean();
    res.json({ success: true, data: notifications });
});
// PATCH /notifications/:id/read
router.patch('/:id/read', auth_1.authMiddleware, async (req, res) => {
    await Notification_1.Notification.updateOne({ _id: req.params.id, user_id: req.user.userId }, { $set: { read: true, read_at: new Date() } });
    res.json({ success: true });
});
// PATCH /notifications/read-all
router.patch('/read-all', auth_1.authMiddleware, async (req, res) => {
    await Notification_1.Notification.updateMany({ user_id: req.user.userId, read: false }, { $set: { read: true, read_at: new Date() } });
    res.json({ success: true });
});
exports.default = router;
//# sourceMappingURL=notifications.js.map