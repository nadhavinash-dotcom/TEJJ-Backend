"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = void 0;
const firebase_admin_1 = require("../config/firebase-admin");
const Notification_1 = require("../models/Notification");
const User_1 = require("../models/User");
const Employer_1 = require("../models/Employer");
const Worker_1 = require("../models/Worker");
exports.notificationService = {
    async sendPushNotification(token, title, body, data) {
        try {
            await firebase_admin_1.admin.messaging().send({
                token,
                notification: { title, body },
                data: data || {},
            });
        }
        catch (err) {
            console.error('FCM general send error:', err);
        }
    },
    async sendFlashJobNotification(fcmToken, workerId, payload) {
        try {
            await firebase_admin_1.admin.messaging().send({
                token: fcmToken,
                notification: {
                    title: '⚡ Flash Job Available',
                    body: `${payload.skill} · ₹${payload.pay_rate} · Apply Now`,
                },
                data: {
                    type: 'FLASH_JOB',
                    job_id: payload.job_id,
                },
                android: { priority: 'high' },
                apns: { payload: { aps: { sound: 'default', badge: 1 } } },
            });
        }
        catch (err) {
            console.error('FCM send error:', err);
        }
    },
    async notifyMatchConfirmed(matchId, employerId) {
        const employer = await Employer_1.Employer.findById(employerId);
        if (!employer)
            return;
        const user = await User_1.User.findOne({ _id: employer.user_id });
        if (!user?.fcm_token)
            return;
        try {
            await firebase_admin_1.admin.messaging().send({
                token: user.fcm_token,
                notification: {
                    title: '✅ Worker Matched!',
                    body: 'A worker has accepted your job. View details.',
                },
                data: { type: 'MATCH_CONFIRMED', match_id: matchId },
            });
        }
        catch { }
    },
    async sendArrivalReminder(workerId, propertyName, matchId) {
        const worker = await Worker_1.Worker.findById(workerId);
        if (!worker)
            return;
        const user = await User_1.User.findOne({ _id: worker.user_id });
        if (!user?.fcm_token)
            return;
        try {
            await firebase_admin_1.admin.messaging().send({
                token: user.fcm_token,
                notification: {
                    title: '⏰ 30 Minute Mein Shift!',
                    body: `${propertyName} — Abhi chalo!`,
                },
                data: { type: 'ARRIVAL_REMINDER', match_id: matchId },
            });
        }
        catch { }
    },
    async createInAppNotification(params) {
        await Notification_1.Notification.create(params);
    },
};
//# sourceMappingURL=notificationService.js.map